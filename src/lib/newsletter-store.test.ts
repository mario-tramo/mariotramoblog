import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import {
	subscribe,
	confirm,
	unsubscribe,
	sweep,
	getStats,
	type RedisLike,
} from './newsletter-store'

interface Store {
	[email: string]: string
}

function mockRedis(): RedisLike & { store: Store } {
	const store: Store = {}
	const api = {
		store,
		async hget<T>(_key: string, field: string): Promise<T | null> {
			return (store[field] as unknown as T | undefined) ?? null
		},
		async hset(_key: string, value: Record<string, unknown>): Promise<'OK'> {
			Object.assign(store, value)
			return 'OK'
		},
		async hgetall<T>(_key: string) {
			const keys = Object.keys(store)
			if (keys.length === 0) return null
			return store as unknown as T
		},
		async hdel(_key: string, field: string) {
			if (field in store) {
				delete store[field]
				return 1
			}
			return 0
		},
	}
	return api
}

function makeRecord(
	email: string,
	over: Partial<{
		status: 'pending' | 'confirmed'
		confirmedAt: string | null
		subscribedAt: string
		confirmToken: string
		unsubToken: string
	}> = {},
) {
	return {
		email,
		status: over.status ?? ('pending' as const),
		subscribedAt: over.subscribedAt ?? new Date().toISOString(),
		confirmedAt: over.confirmedAt ?? null,
		ipHash: 'abcd1234abcd1234',
		confirmToken: over.confirmToken ?? 'cfm-tok-default',
		unsubToken: over.unsubToken ?? 'unsub-tok-default',
	}
}

describe('subscribe', () => {
	test('new email → creates pending record, returns fresh tokens', async () => {
		const r = mockRedis()
		const result = await subscribe('Mario@Rossi.IT', '1.2.3.4', r)

		assert.equal(result.alreadyExists, false)
		assert.equal(result.subscriber.status, 'pending')
		assert.equal(result.subscriber.email, 'mario@rossi.it') // normalized to lowercase
		assert.ok(typeof result.subscriber.confirmToken === 'string')
		assert.ok(result.subscriber.confirmToken.length >= 32)
		assert.notEqual(
			result.subscriber.confirmToken,
			result.subscriber.unsubToken,
		)

		const stored = JSON.parse(r.store['mario@rossi.it']!)
		assert.equal(stored.status, 'pending')
		assert.equal(stored.email, 'mario@rossi.it')
		assert.ok(typeof stored.confirmToken === 'string')
	})

	test('email is normalized (trim + lowercase)', async () => {
		const r = mockRedis()
		await subscribe('  Mario@Example.COM  ', '1.1.1.1', r)
		assert.ok('mario@example.com' in r.store)
		assert.ok(!('Mario@Example.COM' in r.store))
	})

	test('already-confirmed → alreadyExists=true, no token rotation, no rewrite', async () => {
		const r = mockRedis()
		const older = makeRecord('mario@rossi.it', {
			status: 'confirmed',
			confirmToken: 'old-cfm',
			unsubToken: 'old-unsub',
		})
		r.store['mario@rossi.it'] = JSON.stringify(older)

		const result = await subscribe('mario@rossi.it', '5.5.5.5', r)

		assert.equal(result.alreadyExists, true)
		assert.equal(result.subscriber.status, 'confirmed')
		assert.equal(result.subscriber.confirmToken, 'old-cfm')
		assert.equal(result.subscriber.unsubToken, 'old-unsub')

		// Storage NOT mutated
		assert.equal(r.store['mario@rossi.it'], JSON.stringify(older))
	})

	test('already-pending → returns alreadyExists=false, rotates confirm + unsub tokens', async () => {
		const r = mockRedis()
		r.store['mario@rossi.it'] = JSON.stringify(
			makeRecord('mario@rossi.it', { confirmToken: 'old-cfm' }),
		)

		const result = await subscribe('mario@rossi.it', '5.5.5.5', r)

		assert.equal(result.alreadyExists, false)
		const stored = JSON.parse(r.store['mario@rossi.it']!)
		assert.equal(stored.status, 'pending')
		assert.notEqual(stored.confirmToken, 'old-cfm')
	})

	test('null Redis override → throws fail-loud', async () => {
		await assert.rejects(
			subscribe('user@x.it', '1.1.1.1', null),
			/Newsletter storage is unavailable/,
		)
	})
})

describe('confirm', () => {
	test('valid token → flips to confirmed + rotates confirmToken', async () => {
		const r = mockRedis()
		r.store['mario@rossi.it'] = JSON.stringify(
			makeRecord('mario@rossi.it', { confirmToken: 'tok-123' }),
		)

		const result = await confirm('tok-123', r)

		assert.equal(result.ok, true)
		assert.equal(result.email, 'mario@rossi.it')

		const updated = JSON.parse(r.store['mario@rossi.it']!)
		assert.equal(updated.status, 'confirmed')
		assert.ok(typeof updated.confirmedAt === 'string')
		assert.match(updated.confirmedAt!, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
		assert.notEqual(updated.confirmToken, 'tok-123') // rotated
		// unsubToken NOT rotated
		assert.equal(updated.unsubToken, 'unsub-tok-default')
	})

	test('wrong token → ok=false, no mutation', async () => {
		const r = mockRedis()
		const original = makeRecord('mario@rossi.it', { confirmToken: 'tok-123' })
		r.store['mario@rossi.it'] = JSON.stringify(original)

		const result = await confirm('wrong-tok', r)

		assert.equal(result.ok, false)
		assert.equal(r.store['mario@rossi.it'], JSON.stringify(original))
	})

	test('already-confirmed record → ok=false (token rotated away on prior confirm)', async () => {
		const r = mockRedis()
		r.store['mario@rossi.it'] = JSON.stringify(
			makeRecord('mario@rossi.it', {
				status: 'confirmed',
				confirmToken: 'still-same-token', // never rotated
			}),
		)

		const result = await confirm('still-same-token', r)
		assert.equal(result.ok, false)
	})

	test('null Redis → throws', async () => {
		await assert.rejects(
			confirm('tok', null),
			/Newsletter storage is unavailable/,
		)
	})
})

describe('unsubscribe', () => {
	test('by token: removes the record', async () => {
		const r = mockRedis()
		r.store['mario@rossi.it'] = JSON.stringify(
			makeRecord('mario@rossi.it', { unsubToken: 'unsub-abc' }),
		)

		const result = await unsubscribe({ token: 'unsub-abc' }, r)

		assert.equal(result.ok, true)
		assert.ok(!('mario@rossi.it' in r.store))
	})

	test('by email: removes the record (case-insensitive)', async () => {
		const r = mockRedis()
		r.store['mario@rossi.it'] = JSON.stringify(makeRecord('mario@rossi.it'))

		const result = await unsubscribe({ email: 'Mario@Rossi.IT' }, r)

		assert.equal(result.ok, true)
		assert.ok(!('mario@rossi.it' in r.store))
	})

	test('wrong token: ok=false, record kept', async () => {
		const r = mockRedis()
		r.store['mario@rossi.it'] = JSON.stringify(makeRecord('mario@rossi.it'))

		const result = await unsubscribe({ token: 'wrong-unsub' }, r)

		assert.equal(result.ok, false)
		assert.ok('mario@rossi.it' in r.store)
	})

	test('no email nor token → ok=false', async () => {
		const r = mockRedis()
		const result = await unsubscribe({}, r)
		assert.equal(result.ok, false)
	})

	test('non-existent email → ok=false', async () => {
		const r = mockRedis()
		const result = await unsubscribe({ email: 'missing@x.it' }, r)
		assert.equal(result.ok, false)
	})
})

describe('sweep', () => {
	test('removes pending subscriptions older than 7 days', async () => {
		const r = mockRedis()
		const eightDaysAgo = new Date(Date.now() - 8 * 86_400_000).toISOString()
		r.store['old@user.it'] = JSON.stringify(
			makeRecord('old@user.it', { subscribedAt: eightDaysAgo }),
		)
		r.store['new@user.it'] = JSON.stringify(makeRecord('new@user.it'))

		const result = await sweep(new Date(), r)

		assert.equal(result.removedPending, 1)
		assert.equal(result.removedStale, 0)
		assert.ok(!('old@user.it' in r.store))
		assert.ok('new@user.it' in r.store)
	})

	test('removes confirmed subscriptions older than 5-year retention', async () => {
		const r = mockRedis()
		const sixYearsAgo = new Date(
			Date.now() - 6 * 365 * 86_400_000,
		).toISOString()
		r.store['old@user.it'] = JSON.stringify(
			makeRecord('old@user.it', {
				status: 'confirmed',
				subscribedAt: sixYearsAgo,
				confirmedAt: new Date().toISOString(),
			}),
		)
		const recent = new Date(Date.now() - 30 * 86_400_000).toISOString()
		r.store['recent@user.it'] = JSON.stringify(
			makeRecord('recent@user.it', {
				status: 'confirmed',
				subscribedAt: recent,
				confirmedAt: new Date().toISOString(),
			}),
		)

		const result = await sweep(new Date(), r)

		assert.equal(result.removedStale, 1)
		assert.equal(result.removedPending, 0)
		assert.ok(!('old@user.it' in r.store))
		assert.ok('recent@user.it' in r.store)
	})

	test('does not remove pending within retention window', async () => {
		const r = mockRedis()
		const twoDaysAgo = new Date(Date.now() - 2 * 86_400_000).toISOString()
		r.store['mario@rossi.it'] = JSON.stringify(
			makeRecord('mario@rossi.it', { subscribedAt: twoDaysAgo }),
		)

		const result = await sweep(new Date(), r)

		assert.equal(result.removedPending, 0)
		assert.ok('mario@rossi.it' in r.store)
	})

	test('skips malformed JSON entries without throwing', async () => {
		const r = mockRedis()
		r.store['broken@user.it'] = '{not-json'

		const result = await sweep(new Date(), r)

		assert.deepEqual(result, { removedPending: 0, removedStale: 0 })
	})
})

describe('getStats', () => {
	test('counts confirmed vs pending correctly', async () => {
		const r = mockRedis()
		r.store['a@x.it'] = JSON.stringify(
			makeRecord('a@x.it', {
				status: 'confirmed',
				confirmedAt: new Date().toISOString(),
			}),
		)
		r.store['b@x.it'] = JSON.stringify(makeRecord('b@x.it'))
		r.store['c@x.it'] = JSON.stringify(
			makeRecord('c@x.it', {
				status: 'confirmed',
				confirmedAt: new Date().toISOString(),
			}),
		)

		const stats = await getStats(r)

		assert.equal(stats.confirmed, 2)
		assert.equal(stats.pending, 1)
		assert.equal(stats.total, 3)
	})

	test('empty store → all zeros', async () => {
		const stats = await getStats(mockRedis())
		assert.deepEqual(stats, { confirmed: 0, pending: 0, total: 0 })
	})
})
