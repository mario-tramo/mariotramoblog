/**
 * Fantasy read API.
 *
 * Mirrors `src/lib/football-data.ts`: in-memory TTL cache, graceful
 * fallback to empty when Redis is unavailable.
 *
 * Today this is read directly from the rankings ZSET. Player-name
 * hydration can be added later by joining against the player keys
 * populated at ingest.
 */

import { readRanking } from './store'
import type { RankingRow } from './store'

const cache = new Map<string, { data: RankingRow[]; expiresAt: number }>()
const TTL_MS = (() => {
	const raw = process.env.FANTASY_RANKINGS_TTL_SECONDS
	const parsed = raw ? Number(raw) : NaN
	return Number.isFinite(parsed) && parsed > 0 ? parsed * 1000 : 60 * 60 * 1000
})()

export async function getRankings(
	competition: string,
	season: string,
	limit: number,
): Promise<RankingRow[]> {
	const key = `${competition}:${season}:${limit}`
	const cached = cache.get(key)
	if (cached && Date.now() < cached.expiresAt) return cached.data

	const data = await readRanking(competition, season, limit)
	cache.set(key, { data, expiresAt: Date.now() + TTL_MS })
	return data
}
