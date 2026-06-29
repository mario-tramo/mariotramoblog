/**
 * Standings store — Redis read/write for league table data.
 *
 * Mirrors `src/lib/fantasy/store.ts` pattern: typed functions using
 * the same Upstash pipeline helper.
 */

const PREFIX = process.env.STANDINGS_REDIS_PREFIX ?? 'standings'

interface PipelineEnvelope<T> { result?: T; error?: string }

async function upstash<T>(commands: string[][]): Promise<PipelineEnvelope<T>[]> {
	const url = process.env.UPSTASH_REDIS_REST_URL
	const token = process.env.UPSTASH_REDIS_REST_TOKEN
	if (!url || !token) throw new Error('standings store unavailable')
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
		throw new Error(`Upstash pipeline ${res.status}: ${err.slice(0, 200)}`)
	}
	return (await res.json()) as PipelineEnvelope<T>[]
}

export interface ScrapedStandingRow {
	position: number
	team: string
	crest?: string
	playedGames: number
	won: number
	draw: number
	lost: number
	goalsFor: number
	goalsAgainst: number
	goalDifference: number
	points: number
}

export interface ScrapedCompetitionStandings {
	competition: { code: string; name: string }
	season: string
	table: ScrapedStandingRow[]
}

export interface ScrapedStandingsPayload {
	season: string
	standings: Record<string, ScrapedCompetitionStandings>
}

function key(competition: string, season: string): string {
	return `${PREFIX}:${competition}:${season}`
}

export async function writeStandings(
	payload: ScrapedStandingsPayload,
): Promise<number> {
	const entries = Object.entries(payload.standings)
	const commands = entries.map(([code, data]) => [
		'SET',
		key(code, payload.season),
		JSON.stringify(data.table),
	])

	if (commands.length === 0) return 0

	try {
		const results = await upstash<unknown>(commands)
		let ok = 0
		for (const r of results) {
			if (!r.error) ok++
		}
		return ok
	} catch (err) {
		console.error('[standings/store] write failed', err)
		return 0
	}
}

export async function readStandingsTable(
	competition: string,
	season: string,
): Promise<ScrapedStandingRow[] | null> {
	try {
		const [result] = await upstash<string | null>([['GET', key(competition, season)]])
		if (result?.error) throw new Error(result.error)
		if (result?.result == null) return null
		return JSON.parse(result.result) as ScrapedStandingRow[]
	} catch (err) {
		console.error('[standings/store] read failed', err)
		return null
	}
}
