/**
 * Fantasy ingest engine.
 *
 * Mirrors `src/lib/cron-publish.ts`:
 *  - Per-row try/catch, never throws mid-batch.
 *  - Returns `{ processed, indexed, errors }` counts.
 *  - Calling route stays a thin HTTP wrapper.
 *
 * Groups incoming matches by (competition, season), computes per-player
 * season-long Fantasy Index by summing `computeFantasyIndex(row)` over
 * all match rows for that player, then writes both the per-match HASH
 * rows and a per-season ZSET ranking.
 */

import * as Sentry from '@sentry/nextjs'
import { computeFantasyIndex } from './ranking'
import type { IngestMatch, PlayerRank } from './store'
import { writeMatches, writeRanking } from './store'

export interface IngestDeps {
	writeMatches: typeof writeMatches
	writeRanking: typeof writeRanking
}

export interface IngestResult {
	processed: number
	indexed: number
	errors: number
}

export async function ingestMatchStats(
	matches: IngestMatch[],
	deps: IngestDeps = { writeMatches, writeRanking },
): Promise<IngestResult> {
	const groups = new Map<string, IngestMatch[]>()
	for (const m of matches) {
		const key = `${m.competition}:${m.season}`
		const list = groups.get(key)
		if (list) list.push(m)
		else groups.set(key, [m])
	}

	let processed = 0
	let indexed = 0
	let errors = 0

	for (const [key, group] of groups) {
		const [competition, season] = key.split(':')
		const rows: Array<{ matchId: string; playerId: string; payload: IngestMatch }> = []
		const ranks = new Map<string, PlayerRank>()

		for (const m of group) {
			try {
				const idx = computeFantasyIndex(m)
				rows.push({ matchId: m.matchId, playerId: m.playerId, payload: m })
				const prev = ranks.get(m.playerId)
				if (prev) {
					prev.fantasyIndex = Math.round((prev.fantasyIndex + idx) * 100) / 100
					prev.matches += 1
				} else {
					ranks.set(m.playerId, {
						playerId: m.playerId,
						playerName: m.playerName,
						team: m.team,
						position: m.position,
						fantasyIndex: idx,
						matches: 1,
					})
				}
				processed++
			} catch (err) {
				errors++
				console.error('[fantasy/engine] row failed', err)
				Sentry.captureException(err, {
					tags: { service: 'fantasy', operation: 'rowProcessing' },
					extra: { playerId: m.playerId, matchId: m.matchId },
				})
			}
		}

		try {
			await deps.writeMatches(competition, season, rows)
			const sorted: PlayerRank[] = [...ranks.values()].sort(
				(a, b) => b.fantasyIndex - a.fantasyIndex,
			)
			await deps.writeRanking(competition, season, sorted)
			indexed++
		} catch (err) {
			errors++
			console.error('[fantasy/engine] group write failed', err)
			Sentry.captureException(err, {
				tags: { service: 'fantasy', operation: 'groupWrite' },
				extra: { competition, season, rowCount: rows.length },
			})
		}
	}

	return { processed, indexed, errors }
}
