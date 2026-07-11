import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
	const url = request.nextUrl.searchParams.get('url')
	if (!url) {
		return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 })
	}

	if (!/twitter\.com|x\.com/.test(url)) {
		return NextResponse.json({ error: 'Unsupported platform' }, { status: 400 })
	}

	try {
		const oembedUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}&omit_script=1`
		const response = await fetch(oembedUrl, {
			next: { revalidate: 3600 },
		})

		if (!response.ok) {
			return NextResponse.json({ error: 'oEmbed fetch failed' }, { status: 502 })
		}

		const data = await response.json()
		data.html = data.html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')

		const res = NextResponse.json(data)
		res.headers.set('Cache-Control', 'public, max-age=3600, s-maxage=3600')
		return res
	} catch {
		return NextResponse.json({ error: 'Failed to fetch oEmbed' }, { status: 502 })
	}
}
