import { NextRequest, NextResponse } from 'next/server'
import { sweep } from '@/lib/newsletter-store'
import { isAuthorized } from '@/lib/http-auth'

/**
 * GET /api/newsletter/sweep
 *
 * Cron-driven GDPR data-minimization sweeper. Removes:
 * - pending subscriptions older than 7 days (never confirmed = abandoned)
 * - confirmed subscriptions older than the documented retention (5y)
 *
 * Authentication: same pattern as /api/cron/publish-scheduled —
 * Authorization: Bearer <CRON_SECRET> or ?secret=<CRON_SECRET>.
 *
 * Wire it via `vercel.json`:
 *   "crons": [{ "path": "/api/newsletter/sweep", "schedule": "0 3 * * *" }]
 */
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
	if (
		!isAuthorized(request, process.env.CRON_SECRET, {
			headers: ['x-cron-secret'],
		})
	) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	}

	try {
		const result = await sweep()
		return NextResponse.json({ ok: true, ...result })
	} catch (err) {
		console.error('[Newsletter] sweep failed:', err)
		return NextResponse.json({ error: 'Sweep failed' }, { status: 500 })
	}
}
