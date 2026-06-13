import { createClient } from 'next-sanity'
import { revalidatePath, revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { projectId, dataset, apiVersion } from '@/sanity/lib/env'

// Always run fresh — never cache this endpoint.
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Write-enabled client. `perspective: 'raw'` so drafts are visible to the query.
const writeClient = createClient({
	projectId,
	dataset,
	apiVersion,
	token: process.env.SANITY_API_TOKEN,
	useCdn: false,
	perspective: 'raw',
})

interface ScheduledDraft {
	_id: string
	_type: string
	publishAt: string
	[key: string]: unknown
}

function isAuthorized(request: NextRequest): boolean {
	const expected = process.env.CRON_SECRET
	if (!expected) return false

	// Accept any of: `Authorization: Bearer <secret>` (Vercel Cron / QStash style),
	// an `x-cron-secret` header, or a `?secret=` query param (cron-job.org).
	const bearer = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
	const header = request.headers.get('x-cron-secret')
	const query = request.nextUrl.searchParams.get('secret')

	return [bearer, header, query].includes(expected)
}

async function publishScheduledDocuments() {
	const query = `*[
		_id in path("drafts.**") &&
		defined(publishAt) &&
		publishAt <= now()
	]`

	const drafts: ScheduledDraft[] = await writeClient.fetch(query)

	if (drafts.length === 0) {
		return { found: 0, published: 0, errors: 0 }
	}

	let published = 0
	let errors = 0

	for (const draft of drafts) {
		const publishedId = draft._id.replace('drafts.', '')

		try {
			const { publishAt: _publishAt, _id, ...docWithoutSchedule } = draft
			await writeClient.createOrReplace({
				...docWithoutSchedule,
				_id: publishedId,
			})
			await writeClient.delete(draft._id)

			published++
			console.log(`[cron/publish] published ${publishedId} (${draft._type})`)
		} catch (err) {
			errors++
			console.error(`[cron/publish] failed ${publishedId}:`, err)
		}
	}

	return { found: drafts.length, published, errors }
}

export async function GET(request: NextRequest) {
	if (!isAuthorized(request)) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	}

	if (!projectId || !process.env.SANITY_API_TOKEN) {
		return NextResponse.json(
			{ error: 'Missing Sanity project id or API token' },
			{ status: 500 },
		)
	}

	const result = await publishScheduledDocuments()

	// Revalidate the frontend in-process when something was published.
	if (result.published > 0) {
		revalidateTag('sanity', { expire: 0 })
		revalidatePath('/', 'layout')
	}

	console.log('[cron/publish] done', JSON.stringify(result))

	return NextResponse.json({ ok: true, ...result })
}
