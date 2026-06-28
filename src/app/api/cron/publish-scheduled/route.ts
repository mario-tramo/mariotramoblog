import { createClient } from '@sanity/client'
import { revalidatePath, revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
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
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	}

	if (!projectId || !process.env.SANITY_API_WRITE_TOKEN) {
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

	console.log('[cron/publish] done', JSON.stringify(result))

	return NextResponse.json({ ok: true, ...result })
}
