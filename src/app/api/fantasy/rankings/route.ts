import { NextRequest, NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { getRankings } from '@/lib/fantasy/api'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function defaultSeason(): string {
	const now = new Date()
	const start = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1
	return `${start}-${start + 1}`
}

export async function GET(request: NextRequest) {
	const competition = request.nextUrl.searchParams.get('competition') ?? 'SA'
	const season = request.nextUrl.searchParams.get('season') ?? defaultSeason()
	const rawLimit = Number(request.nextUrl.searchParams.get('limit'))
	const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 500) : 100

	try {
		const items = await getRankings(competition, season, limit)
		return NextResponse.json({ competition, season, count: items.length, items })
	} catch (err) {
		console.error('[fantasy/rankings]', err)
		Sentry.captureException(err, {
			tags: { service: 'fantasy', operation: 'rankingsEndpoint' },
			extra: { competition, season, limit },
		})
		return NextResponse.json(
			{ error: 'Rankings unavailable' },
			{ status: 500 },
		)
	}
}
