import { NextRequest, NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import {
	fetchStandings,
	COMPETITIONS,
	type CompetitionCode,
} from '@/lib/football-data'

export async function GET(request: NextRequest) {
	const competition = request.nextUrl.searchParams.get('competition')

	if (!competition || !(competition in COMPETITIONS)) {
		return NextResponse.json(
			{
				error: `Invalid competition. Valid: ${Object.keys(COMPETITIONS).join(', ')}`,
			},
			{ status: 400 },
		)
	}

	try {
		const data = await fetchStandings(competition as CompetitionCode)
		return NextResponse.json(data, {
			headers: {
				'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
			},
		})
	} catch (error) {
		const message =
			error instanceof Error ? error.message : 'Unknown error'
		Sentry.captureException(error, {
			tags: { service: 'standings', operation: 'readEndpoint' },
			extra: { competition },
		})
		return NextResponse.json({ error: message }, { status: 500 })
	}
}
