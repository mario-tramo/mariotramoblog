import { NextRequest, NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { isAuthorized } from '@/lib/http-auth'
import { readAllStandingsTables } from '@/lib/standings/store'
import { COMPETITIONS } from '@/lib/football-data'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function currentSeason(): number {
	const now = new Date()
	return now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1
}

interface CompetitionStatus {
	code: string
	name: string
	available: boolean
	teamCount: number
}

export async function GET(request: NextRequest) {
	if (
		!isAuthorized(request, process.env.CRON_SECRET, {
			headers: ['x-cron-secret'],
		})
	) {
		Sentry.captureMessage('standings/cron unauthorized attempt', { level: 'warning' })
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	}

	const season = String(currentSeason())
	const entries = Object.entries(COMPETITIONS)
	const codes = entries.map(([code]) => code)
	const allRows = await readAllStandingsTables(codes, season)

	const statuses: CompetitionStatus[] = []
	let totalCompetitions = 0
	let availableCompetitions = 0

	for (const [code, name] of entries) {
		totalCompetitions++
		const rows = allRows.get(code) ?? null
		const available = rows !== null && rows.length > 0
		if (available) availableCompetitions++
		statuses.push({
			code,
			name,
			available,
			teamCount: rows?.length ?? 0,
		})
	}

	const allAvailable = availableCompetitions === totalCompetitions

	Sentry.withScope((scope) => {
		scope.setTag('service', 'standings')
		scope.setExtra('season', season)
		scope.setExtra('statuses', statuses)
		scope.setExtra('availableCompetitions', availableCompetitions)
		scope.setExtra('totalCompetitions', totalCompetitions)
		if (!allAvailable) {
			const missing = statuses.filter((s) => !s.available).map((s) => s.code)
			scope.setExtra('missingCompetitions', missing)
			Sentry.captureMessage('standings/cron some competitions missing', { level: 'error' })
		} else {
			Sentry.captureMessage('standings/cron all competitions available', { level: 'info' })
		}
	})

	return NextResponse.json({
		ok: true,
		season,
		allAvailable,
		competitions: statuses,
	})
}
