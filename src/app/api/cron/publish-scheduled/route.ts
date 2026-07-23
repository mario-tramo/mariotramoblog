import { createClient } from '@sanity/client'
import { revalidatePath, revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'
import { projectId, dataset, apiVersion } from '@/sanity/lib/env'
import { isAuthorized } from '@/lib/http-auth'
import { publishScheduledDrafts } from '@/lib/cron-publish'

// Always run fresh — never cache this endpoint.
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Write-enabled client. `perspective: 'raw'` so drafts are visible to the query.
const writeClient = createClient({
	projectId,
	dataset,
	apiVersion,
	token: process.env.SANITY_API_WRITE_TOKEN,
	useCdn: false,
	perspective: 'raw',
})

export async function GET(request: NextRequest) {
	if (
		!isAuthorized(request, process.env.CRON_SECRET, {
			headers: ['x-cron-secret'],
		})
	) {
		Sentry.captureMessage('cron/publish unauthorized attempt', { level: 'warning' })
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	}

	if (!projectId || !process.env.SANITY_API_WRITE_TOKEN) {
		Sentry.captureMessage('cron/publish missing Sanity config', { level: 'error' })
		return NextResponse.json(
			{ error: 'Missing Sanity project id or API token' },
			{ status: 500 },
		)
	}

	const result = await publishScheduledDrafts({ client: writeClient })

	// Revalidate the frontend in-process when something was actually
	// published. Without this, the cron-promoted documents would not
	// appear on the site until the next manual /api/revalidate or a new
	// deployment — defeating the whole scheduled-publishing purpose.
	if (result.published > 0) {
		revalidateTag('sanity', { expire: 0 })
		revalidatePath('/', 'layout')
	}

	Sentry.withScope((scope) => {
		scope.setExtras({ found: result.found, published: result.published, errors: result.errors })
		if (result.errors > 0) {
			Sentry.captureMessage('cron/publish completed with errors', { level: 'error' })
		} else if (result.published > 0) {
			Sentry.captureMessage(`cron/publish published ${result.published} drafts`, { level: 'info' })
		}
	})

	console.log('[cron/publish] done', JSON.stringify(result))

	return NextResponse.json({ ok: true, ...result })
}
