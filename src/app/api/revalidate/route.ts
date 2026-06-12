import { revalidatePath, revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
	const secret =
		request.headers.get('x-revalidate-secret') ??
		request.nextUrl.searchParams.get('secret')

	if (secret !== process.env.REVALIDATE_SECRET) {
		console.warn('[revalidate] rejected: invalid secret', {
			hasHeader: request.headers.has('x-revalidate-secret'),
			hasQuery: request.nextUrl.searchParams.has('secret'),
		})
		return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
	}

	let body: { path?: string; paths?: string[] } = {}

	try {
		body = await request.json()
	} catch {
		// Sanity webhooks may be configured without a JSON body.
	}

	console.log('[revalidate] received', JSON.stringify(body))

	// `{ expire: 0 }` forces immediate expiration (full revalidation), which is
	// required in Next 16 — `revalidateTag(tag)` alone is deprecated, and the
	// `'max'` profile only does stale-while-revalidate (no immediate purge).
	revalidateTag('sanity', { expire: 0 })
	revalidatePath('/', 'layout')

	const paths = [body.path, ...(body.paths ?? [])].filter(
		(path): path is string => typeof path === 'string' && path.startsWith('/'),
	)

	for (const path of paths) {
		revalidatePath(path)
	}

	const result = {
		revalidated: true,
		paths: ['/', ...paths],
		tags: ['sanity'],
		now: Date.now(),
	}

	console.log('[revalidate] done', JSON.stringify(result))

	return NextResponse.json(result)
}
