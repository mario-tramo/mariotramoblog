import { NextRequest, NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { isAuthorized } from '@/lib/http-auth'
import { writeStandings } from '@/lib/standings/store'

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

	if (!body || typeof body !== 'object' || !('season' in (body as Record<string, unknown>)) || !('standings' in (body as Record<string, unknown>))) {
		Sentry.captureMessage('standings/ingest invalid payload shape', { level: 'warning' })
		return NextResponse.json(
			{ error: 'Expected { season: string, standings: Record<string, {...}> }' },
			{ status: 400 },
		)
	}

	const result = await writeStandings(body as Parameters<typeof writeStandings>[0])

	Sentry.withScope((scope) => {
		scope.setTag('service', 'standings')
		scope.setExtra('competitionsWritten', result)
		const season = (body as Record<string, unknown>).season as string
		if (season) scope.setExtra('season', season)
		if (result > 0) {
			Sentry.captureMessage('standings/ingest success', { level: 'info' })
		} else {
			Sentry.captureMessage('standings/ingest no competitions written', { level: 'error' })
		}
	})

	return NextResponse.json({ ok: true, competitionsWritten: result })
}
