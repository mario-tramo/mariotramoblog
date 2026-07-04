import { revalidatePath, revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { isAuthorized } from '@/lib/http-auth'
import { processRevalidation, type RevalidatePayload } from '@/lib/revalidate-handler'
import { resolveUrlFromDocument, submitToIndexNow } from '@/lib/indexnow'

/**
 * POST /api/revalidate — Sanity publish-time cache invalidation.
 *
 * Body shape (all fields optional except auth):
 *   {
 *     "path"?:     "/blog/mio-articolo",
 *     "paths"?:    ["/a", "/b"],
 *     "tags"?:     ["sanity:type:blog.post", "sanity:slug:mio-articolo"],
 *     "document"?: { "_type": "blog.post", "_id": "...", "slug": "..." }
 *   }
 *
 * Auth via `x-revalidate-secret` header, `Authorization: Bearer`, or
 * `?secret=` query param. Compared in constant-time via `safeEqual`.
 */
export async function POST(request: NextRequest) {
	if (!isAuthorized(request, process.env.REVALIDATE_SECRET, {
		headers: ['x-revalidate-secret'],
	})) {
		console.warn('[revalidate] rejected: invalid secret', {
			hasHeader: request.headers.has('x-revalidate-secret'),
			hasQuery: request.nextUrl.searchParams.has('secret'),
		})
		return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
	}

	let body: RevalidatePayload = {}

	try {
		body = (await request.json()) as RevalidatePayload
	} catch (err) {
		console.warn('[revalidate] no JSON body (expected for Sanity webhooks):', err)
	}

	console.log('[revalidate] received', JSON.stringify(body))

	const outcome = processRevalidation(body, {
		revalidateTag,
		revalidatePath,
	})

	// Notify IndexNow so search engines crawl updated content immediately
	if (body.document) {
		const url = await resolveUrlFromDocument(body.document)
		const paths = outcome.paths.filter((p) => p !== '/')
		const urls = [
			...(url ? [url] : []),
			...paths.map((p) => {
				const base = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/+$/, '')
				return base ? `${base}${p}` : null
			}).filter(Boolean) as string[],
		]
		if (urls.length > 0) {
			submitToIndexNow(urls).then((ok) => {
				if (ok) console.log('[revalidate] indexnow submitted', urls.length, 'urls')
			})
		}
	}

	const result = {
		revalidated: true,
		flushedTags: outcome.flushedTags,
		paths: outcome.paths,
		now: Date.now(),
	}

	console.log('[revalidate] done', JSON.stringify(result))

	return NextResponse.json(result)
}
