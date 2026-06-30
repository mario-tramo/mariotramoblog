/**
 * Fantasy store — Redis read/write for player-match stats and rankings.
 *
 * Mirrors `src/lib/newsletter-store.ts` style: typed interface, takes a
 * RedisLike-like dep so tests can swap. We use Upstash directly via
 * `src/lib/redis.ts` because all access is server-only Next.js code.
 */

import * as Sentry from '@sentry/nextjs'

const PREFIX = (process.env.FANTASY_REDIS_PREFIX ?? 'fantasy').replace(/[:]+$/, '')

// Upstash REST direct access via the /pipeline endpoint.
//
// Why /pipeline and not /<cmd>/<key>?
//   - `POST /ZADD/<key>` with body `["score","member",...]` returns 400
//     "wrong number of arguments" — Upstash's per-command endpoint has bugs
//     around arg handling for non-trivial commands.
//   - `POST /pipeline` with body `[["CMD","key",...args], ...]` works
//     reliably for every command including DEL, HSET, ZADD, ZREVRANGE.
// Single commands are still issued as a one-element pipeline for uniformity.
//
// Response envelope: `[{ result: T }, { result: T2 }, ...]` (ordered).
// Upstash /pipeline always responds `[{result: T}, ...]` envelope; per-command
// failures come back as whole-pipeline HTTP errors caught below, not as
// `{error}` envelopes. The optional fields here are just defensive typing.
type PipelineEnvelope<T> = { result?: T; error?: string }

async function upstash<T>(commands: string[][]): Promise<PipelineEnvelope<T>[]> {
	const url = process.env.UPSTASH_REDIS_REST_URL
	const token = process.env.UPSTASH_REDIS_REST_TOKEN
	if (!url || !token) {
		Sentry.captureMessage('fantasy/store missing Redis config', { level: 'error', tags: { service: 'fantasy' } })
		throw new Error('fantasy store unavailable')
	}
	const res = await fetch(`${url}/pipeline`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(commands),
		signal: AbortSignal.timeout(5000),
	})
	if (!res.ok) {
		const err = await res.text().catch(() => '')
		Sentry.captureException(new Error(`Upstash pipeline ${res.status}: ${err.slice(0, 200)}`), {
			tags: { service: 'fantasy', operation: 'upstash' },
		})
		throw new Error(`Upstash pipeline ${res.status}: ${err.slice(0, 200)}`)
	}
	return (await res.json()) as PipelineEnvelope<T>[]
}

export interface IngestMatch {
	season: string
	competition: string
	matchday: number
	matchId: string
	playerId: string
	playerName: string
	team: string
	position: 'GK' | 'DEF' | 'MID' | 'FWD'
	minutes: number
	goals: number
	assists: number
	xG: number
	xA: number
	keyPasses: number
	progressivePasses: number
	tacklesWon: number
	recoveries: number
	cleanSheet: boolean
}

export interface PlayerRank {
	playerId: string
	playerName: string
	team: string
	position: 'GK' | 'DEF' | 'MID' | 'FWD'
	fantasyIndex: number
	matches: number
}

function matchesKey(competition: string, season: string, matchId: string): string {
	return `${PREFIX}:matches:${competition}:${season}:${matchId}`
}

function rankingsKey(competition: string, season: string): string {
	return `${PREFIX}:rankings:${competition}:${season}`
}

export async function writeMatches(
	competition: string,
	season: string,
	rows: Array<{ matchId: string; playerId: string; payload: IngestMatch }>,
): Promise<{ written: number; errors: number }> {
	if (rows.length === 0) return { written: 0, errors: 0 }
	const commands = rows.map((r) => [
		'HSET',
		matchesKey(competition, season, r.matchId),
		r.playerId,
		JSON.stringify(r.payload),
	])
	try {
		const results = await upstash<string>(commands)
		let written = 0
		let errors = 0
		for (const r of results) {
			if (r.error) errors++
			else written++
		}
		Sentry.withScope((scope) => {
			scope.setTag('service', 'fantasy')
			scope.setExtra('totalRows', rows.length)
			scope.setExtra('written', written)
			scope.setExtra('errors', errors)
			Sentry.captureMessage('fantasy/store matches write complete', { level: 'info' })
		})
		return { written, errors }
	} catch (err) {
		console.error('[fantasy/store] hset pipeline failed', err)
		Sentry.captureException(err, {
			tags: { service: 'fantasy', operation: 'writeMatches' },
			extra: { competition, season, rowCount: rows.length },
		})
		return { written: 0, errors: rows.length }
	}
}

export async function writeRanking(
	competition: string,
	season: string,
	ranks: PlayerRank[],
): Promise<void> {
	const key = rankingsKey(competition, season)
	// Replace strategy: stale members would skew ZRANGE so clear first.
	try {
		const [del] = await upstash<number>([['DEL', key]])
		if (del?.error) {
			Sentry.captureMessage('fantasy/store del failed', { level: 'warning', tags: { service: 'fantasy' }, extra: { error: del.error } })
		}
	} catch (err) {
		console.warn('[fantasy/store] del failed (continuing)', err)
		Sentry.captureException(err, { tags: { service: 'fantasy', operation: 'writeRankingDel' } })
	}
	if (ranks.length === 0) return
	const args: Array<string> = []
	for (const r of ranks) {
		args.push(String(r.fantasyIndex), r.playerId)
	}
	const [addRes] = await upstash<number>([['ZADD', key, ...args]])
	if (addRes?.error) {
		Sentry.captureMessage(`Upstash ZADD: ${addRes.error}`, { level: 'error', tags: { service: 'fantasy', operation: 'writeRankingZadd' } })
		throw new Error(`Upstash ZADD: ${addRes.error}`)
	}
}

export interface RankingRow {
	playerId: string
	fantasyIndex: number
}

export async function readRanking(
	competition: string,
	season: string,
	limit: number,
): Promise<RankingRow[]> {
	if (!process.env.UPSTASH_REDIS_REST_URL) {
		Sentry.captureMessage('fantasy/store readRanking no Redis URL', { level: 'warning', tags: { service: 'fantasy' } })
		return []
	}
	const key = rankingsKey(competition, season)
	// ZREVRANGE returns [member1, score1, member2, score2, ...] flat.
	const [zrev] = await upstash<string[]>([
		['ZREVRANGE', key, '0', String(Math.max(0, limit - 1)), 'WITHSCORES'],
	])
	if (zrev?.error) {
		Sentry.captureMessage(`Upstash ZREVRANGE: ${zrev.error}`, { level: 'error', tags: { service: 'fantasy', operation: 'readRanking' } })
		throw new Error(`Upstash ZREVRANGE: ${zrev.error}`)
	}
	const flat = zrev?.result ?? []
	const out: RankingRow[] = []
	for (let i = 0; i + 1 < flat.length; i += 2) {
		out.push({ playerId: flat[i], fantasyIndex: Number(flat[i + 1]) })
	}
	return out
}
