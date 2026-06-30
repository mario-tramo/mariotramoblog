import * as Sentry from '@sentry/nextjs'
import { readStandingsTable } from '@/lib/standings/store'

export const COMPETITIONS = {
	SA: 'Serie A',
	PL: 'Premier League',
	PD: 'La Liga',
	BL1: 'Bundesliga',
	FL1: 'Ligue 1',
	CL: 'Champions League',
} as const

export type CompetitionCode = keyof typeof COMPETITIONS

export interface Standing {
	position: number
	team: {
		id: number
		name: string
		shortName: string
		crest?: string
	}
	playedGames: number
	won: number
	draw: number
	lost: number
	points: number
	goalsFor: number
	goalsAgainst: number
	goalDifference: number
}

export interface StandingsResponse {
	competition: {
		name: string
		code: string
		emblem: string
	}
	season: {
		startDate: string
		endDate: string
		currentMatchday?: number
	}
	standings: {
		stage: string
		type: string
		table: Standing[]
	}[]
}

export const APIErrorCode = {
	MISSING_KEY: 'MISSING_KEY',
	INVALID_KEY: 'INVALID_KEY',
	RATE_LIMITED: 'RATE_LIMITED',
	SERVICE_ERROR: 'SERVICE_ERROR',
	NETWORK_ERROR: 'NETWORK_ERROR',
} as const

type APIErrorCodeValue = (typeof APIErrorCode)[keyof typeof APIErrorCode]

export class StandingsError extends Error {
	code: APIErrorCodeValue
	constructor(code: APIErrorCodeValue, message: string) {
		super(message)
		this.code = code
		this.name = 'StandingsError'
	}
}

function currentSeason(): number {
	const now = new Date()
	return now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1
}

function teamId(name: string): number {
	let hash = 0
	for (let i = 0; i < name.length; i++) {
		hash = ((hash << 5) - hash) + name.charCodeAt(i)
		hash |= 0
	}
	return Math.abs(hash)
}

// In-memory cache with TTL
const cache = new Map<string, { data: StandingsResponse; expiresAt: number }>()
const CACHE_TTL = 60 * 60 * 1000

export async function fetchStandings(
	competition: CompetitionCode,
): Promise<StandingsResponse> {
	const cached = cache.get(competition)
	if (cached && Date.now() < cached.expiresAt) {
		return cached.data
	}

	if (!process.env.UPSTASH_REDIS_REST_URL) {
		Sentry.captureMessage('football-data Redis not configured', {
			level: 'error',
			tags: { service: 'standings', competition },
		})
		throw new StandingsError(APIErrorCode.SERVICE_ERROR, 'Redis non configurato')
	}

	const season = String(currentSeason())
	const rows = await readStandingsTable(competition, season)

	if (!rows || rows.length === 0) {
		Sentry.captureMessage('football-data no standings for competition', {
			level: 'warning',
			tags: { service: 'standings', competition },
			extra: { season },
		})
		throw new StandingsError(APIErrorCode.SERVICE_ERROR, 'Nessuna classifica disponibile per questo campionato')
	}

	const competitionName = COMPETITIONS[competition]

	const data: StandingsResponse = {
		competition: {
			name: competitionName,
			code: competition,
			emblem: '',
		},
		season: {
			startDate: `${season}-07-01`,
			endDate: `${Number(season) + 1}-06-30`,
		},
		standings: [
			{
				stage: 'Regular Season',
				type: 'TOTAL',
				table: rows.map((r): Standing => ({
					position: r.position,
					team: {
						id: teamId(r.team),
						name: r.team,
						shortName: r.team,
						...(r.crest ? { crest: r.crest } : {}),
					},
					playedGames: r.playedGames,
					won: r.won,
					draw: r.draw,
					lost: r.lost,
					points: r.points,
					goalsFor: r.goalsFor,
					goalsAgainst: r.goalsAgainst,
					goalDifference: r.goalDifference,
				})),
			},
		],
	}

	cache.set(competition, { data, expiresAt: Date.now() + CACHE_TTL })
	return data
}
