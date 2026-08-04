import { NextRequest, NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { isAuthorized } from '@/lib/http-auth'
import { validateStandingsPayload, writeStandings } from '@/lib/standings/store'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
	if (!isAuthorized(request, process.env.STANDINGS_INGEST_SECRET)) {
		Sentry.captureMessage('standings/ingest unauthorized attempt', { level: 'warning' })
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	}

	let body: unknown
	try {
		body = await request.json()
	} catch {
		Sentry.captureMessage('standings/ingest invalid JSON', { level: 'warning' })
		return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
	}

	if (!validateStandingsPayload(body)) {
		Sentry.captureMessage('standings/ingest invalid payload data', { level: 'warning' })
		return NextResponse.json(
			{ error: 'Invalid standings payload: expected complete validated league tables' },
			{ status: 422 },
		)
	}

	const result = await writeStandings(body)

	Sentry.withScope((scope) => {
		scope.setTag('service', 'standings')
		scope.setExtra('competitionsWritten', result)
		const season = body.season
		if (season) scope.setExtra('season', season)
		if (result > 0) {
			Sentry.captureMessage('standings/ingest success', { level: 'info' })
		} else {
			Sentry.captureMessage('standings/ingest no competitions written', { level: 'error' })
		}
	})

	if (result !== Object.keys(body.standings).length) {
		return NextResponse.json(
			{ error: 'Standings write incomplete', competitionsWritten: result },
			{ status: 503 },
		)
	}

	return NextResponse.json({ ok: true, competitionsWritten: result })
}
