import { revalidatePath, revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
	const secret =
		request.headers.get('x-revalidate-secret') ??
		request.nextUrl.searchParams.get('secret')

	if (secret !== process.env.REVALIDATE_SECRET) {
		return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
	}

	let body: { path?: string; paths?: string[] } = {}

	try {
		body = await request.json()
	} catch {
		// Sanity webhooks may be configured without a JSON body.
	}

	revalidateTag('sanity', { expire: 0 })
	revalidatePath('/', 'layout')

	const paths = [body.path, ...(body.paths ?? [])].filter(
		(path): path is string => typeof path === 'string' && path.startsWith('/'),
	)

	for (const path of paths) {
		revalidatePath(path)
	}

	return NextResponse.json({
		revalidated: true,
		paths: ['/', ...paths],
		tags: ['sanity'],
		now: Date.now(),
	})
}
