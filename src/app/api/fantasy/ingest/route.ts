import { NextRequest, NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { isAuthorized } from '@/lib/http-auth'
import { ingestMatchStats } from '@/lib/fantasy/engine'
import { writeMatches, writeRanking } from '@/lib/fantasy/store'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const MAX_BATCH = 10_000

export async function POST(request: NextRequest) {
	if (!isAuthorized(request, process.env.FANTASY_INGEST_SECRET)) {
		Sentry.captureMessage('fantasy/ingest unauthorized attempt', { level: 'warning' })
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	}

	let body: unknown
	try {
		body = await request.json()
	} catch {
		Sentry.captureMessage('fantasy/ingest invalid JSON', { level: 'warning' })
		return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
	}

	if (!Array.isArray(body) || body.length === 0) {
		Sentry.captureMessage('fantasy/ingest empty array', { level: 'warning' })
		return NextResponse.json(
			{ error: 'Expected a non-empty array of matches' },
			{ status: 400 },
		)
	}

	if (body.length > MAX_BATCH) {
		Sentry.captureMessage('fantasy/ingest batch too large', {
			level: 'warning',
			extra: { batchSize: body.length, maxBatch: MAX_BATCH },
		})
		return NextResponse.json(
			{ error: `Batch too large (max ${MAX_BATCH})` },
			{ status: 413 },
		)
	}

	const result = await ingestMatchStats(body, { writeMatches, writeRanking })

	Sentry.withScope((scope) => {
		scope.setTag('service', 'fantasy')
		scope.setExtra('result', result)
		if (result.errors > 0) {
			Sentry.captureMessage('fantasy/ingest completed with errors', { level: 'error' })
		} else {
			Sentry.captureMessage('fantasy/ingest success', { level: 'info' })
		}
	})

	return NextResponse.json({ ok: true, ...result })
}
