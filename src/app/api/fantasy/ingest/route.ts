import { NextRequest, NextResponse } from 'next/server'
import { isAuthorized } from '@/lib/http-auth'
import { ingestMatchStats } from '@/lib/fantasy/engine'
import { writeMatches, writeRanking } from '@/lib/fantasy/store'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const MAX_BATCH = 10_000

export async function POST(request: NextRequest) {
	if (!isAuthorized(request, process.env.FANTASY_INGEST_SECRET)) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	}

	let body: unknown
	try {
		body = await request.json()
	} catch {
		return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
	}

	if (!Array.isArray(body) || body.length === 0) {
		return NextResponse.json(
			{ error: 'Expected a non-empty array of matches' },
			{ status: 400 },
		)
	}

	if (body.length > MAX_BATCH) {
		return NextResponse.json(
			{ error: `Batch too large (max ${MAX_BATCH})` },
			{ status: 413 },
		)
	}

	const result = await ingestMatchStats(body, { writeMatches, writeRanking })
	console.log('[fantasy/ingest]', JSON.stringify(result))
	return NextResponse.json({ ok: true, ...result })
}
