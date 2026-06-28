import { genToken, sha256 } from './crypto'

const HASH_KEY = 'newsletter:subscribers'
const PENDING_TTL = 7 * 86_400_000
const CONFIRMED_RETENTION = 5 * 365 * 86_400_000

export interface RedisLike {
	hget<T>(key: string, field: string): Promise<T | null>
	hset(key: string, value: Record<string, unknown>): Promise<'OK'>
	hgetall<T>(key: string): Promise<T | null>
	hdel(key: string, field: string): Promise<number>
}

type SubscriberRecord = {
	email: string
	status: 'pending' | 'confirmed'
	subscribedAt: string
	confirmedAt: string | null
	ipHash: string
	confirmToken: string
	unsubToken: string
}

async function getRedis(): Promise<RedisLike> {
	const { default: Redis } = await import('@upstash/redis')
	const { redis } = await import('@/lib/redis')
	return (redis as unknown as RedisLike)
}

async function withRedis<T>(fn: (r: RedisLike) => Promise<T>): Promise<T> {
	const r = await getRedis()
	return fn(r)
}

export async function subscribe(
	email: string,
	ip: string,
	redisOverride?: RedisLike | null,
) {
	const r = redisOverride ?? (await getRedis())

	const ipHash = sha256(ip)
	const normalized = email.trim().toLowerCase()

	const raw = await r.hget<string>(HASH_KEY, normalized)

	if (raw) {
		const existing: SubscriberRecord = JSON.parse(raw)
		if (existing.status === 'confirmed') {
			return { alreadyExists: true as const, subscriber: existing }
		}

		const confirmToken = genToken(32)
		const unsubToken = genToken(32)
		const updated: SubscriberRecord = {
			...existing,
			ipHash,
			confirmToken,
			unsubToken,
		}
		await r.hset(HASH_KEY, { [normalized]: JSON.stringify(updated) })
		return { alreadyExists: false as const, subscriber: updated }
	}

	const confirmToken = genToken(32)
	const unsubToken = genToken(32)
	const record: SubscriberRecord = {
		email: normalized,
		status: 'pending',
		subscribedAt: new Date().toISOString(),
		confirmedAt: null,
		ipHash,
		confirmToken,
		unsubToken,
	}
	await r.hset(HASH_KEY, { [normalized]: JSON.stringify(record) })
	return { alreadyExists: false as const, subscriber: record }
}

export async function confirm(
	token: string,
	redisOverride?: RedisLike | null,
): Promise<{ ok: boolean; email?: string }> {
	const r = redisOverride ?? (await getRedis())

	const all = await r.hgetall<Record<string, string>>(HASH_KEY)
	if (!all) return { ok: false }

	for (const [email, raw] of Object.entries(all)) {
		let record: SubscriberRecord
		try {
			record = JSON.parse(raw)
		} catch {
			continue
		}

		if (record.status === 'confirmed') continue
		if (record.confirmToken !== token) continue

		const updated: SubscriberRecord = {
			...record,
			status: 'confirmed',
			confirmedAt: new Date().toISOString(),
			confirmToken: genToken(32),
		}
		await r.hset(HASH_KEY, { [email]: JSON.stringify(updated) })
		return { ok: true, email: record.email }
	}

	return { ok: false }
}

export async function unsubscribe(
	opts: { token?: string; email?: string },
	redisOverride?: RedisLike | null,
): Promise<{ ok: boolean }> {
	const r = redisOverride ?? (await getRedis())

	if (opts.email) {
		const normalized = opts.email.trim().toLowerCase()
		const existed = await r.hdel(HASH_KEY, normalized)
		return { ok: existed === 1 }
	}

	if (opts.token) {
		const all = await r.hgetall<Record<string, string>>(HASH_KEY)
		if (!all) return { ok: false }

		for (const [email, raw] of Object.entries(all)) {
			let record: SubscriberRecord
			try {
				record = JSON.parse(raw)
			} catch {
				continue
			}

			if (record.unsubToken === opts.token) {
				await r.hdel(HASH_KEY, email)
				return { ok: true }
			}
		}
	}

	return { ok: false }
}

export async function sweep(
	now: Date = new Date(),
	redisOverride?: RedisLike | null,
): Promise<{ removedPending: number; removedStale: number }> {
	const r = redisOverride ?? (await getRedis())

	const all = await r.hgetall<Record<string, string>>(HASH_KEY)
	if (!all) return { removedPending: 0, removedStale: 0 }

	let removedPending = 0
	let removedStale = 0

	for (const [email, raw] of Object.entries(all)) {
		let record: SubscriberRecord
		try {
			record = JSON.parse(raw)
		} catch {
			continue
		}

		const age = now.getTime() - new Date(record.subscribedAt).getTime()

		if (record.status === 'pending' && age > PENDING_TTL) {
			await r.hdel(HASH_KEY, email)
			removedPending++
		} else if (record.status === 'confirmed' && age > CONFIRMED_RETENTION) {
			await r.hdel(HASH_KEY, email)
			removedStale++
		}
	}

	return { removedPending, removedStale }
}

export async function getStats(
	redisOverride?: RedisLike | null,
): Promise<{ confirmed: number; pending: number; total: number }> {
	const r = redisOverride ?? (await getRedis())

	const all = await r.hgetall<Record<string, string>>(HASH_KEY)
	if (!all) return { confirmed: 0, pending: 0, total: 0 }

	let confirmed = 0
	let pending = 0

	for (const raw of Object.values(all)) {
		let record: SubscriberRecord
		try {
			record = JSON.parse(raw)
		} catch {
			continue
		}

		if (record.status === 'confirmed') confirmed++
		else pending++
	}

	return { confirmed, pending, total: confirmed + pending }
}
