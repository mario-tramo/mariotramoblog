const FOOTBALL_DATA_BASE_URL = 'https://api.football-data.org/v4'

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
		crest: string
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
		currentMatchday: number
	}
	standings: {
		stage: string
		type: string
		table: Standing[]
	}[]
}

export async function fetchStandings(
	competition: CompetitionCode,
): Promise<StandingsResponse> {
	const apiKey = process.env.FOOTBALL_DATA_API_KEY

	if (!apiKey) {
		throw new Error('FOOTBALL_DATA_API_KEY is not set')
	}

	const res = await fetch(
		`${FOOTBALL_DATA_BASE_URL}/competitions/${competition}/standings`,
		{
			headers: { 'X-Auth-Token': apiKey },
			next: { revalidate: 3600 },
		},
	)

	if (!res.ok) {
		throw new Error(
			`football-data.org API error: ${res.status} ${res.statusText}`,
		)
	}

	return res.json()
}
