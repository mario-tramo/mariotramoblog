import { NextRequest, NextResponse } from 'next/server'
import { isAuthorized } from '@/lib/http-auth'
import { writeStandings } from '@/lib/standings/store'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
	if (!isAuthorized(request, process.env.STANDINGS_INGEST_SECRET)) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	}

	let body: unknown
	try {
		body = await request.json()
	} catch {
		return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
	}

	if (!body || typeof body !== 'object' || !('season' in (body as Record<string, unknown>)) || !('standings' in (body as Record<string, unknown>))) {
		return NextResponse.json(
			{ error: 'Expected { season: string, standings: Record<string, {...}> }' },
			{ status: 400 },
		)
	}

	const result = await writeStandings(body as Parameters<typeof writeStandings>[0])
	console.log('[standings/ingest]', JSON.stringify({ competitions: result }))
	return NextResponse.json({ ok: true, competitionsWritten: result })
}
