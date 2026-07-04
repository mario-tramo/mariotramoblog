import { fetchSanity } from '@/sanity/lib/fetch'
import groq from 'groq'
import { BASE_URL } from '@/lib/env'

// Google News only surfaces articles published in the last 48h, so the
// window must slide: regenerate at most every 15 minutes.
export const revalidate = 900

export async function GET() {
	const base = BASE_URL.replace(/\/+$/, '') + '/'

	// publishDate can be date-only ('2026-06-24') or a full datetime, and GROQ's
	// now() is a string: both sides must go through dateTime() or the filter
	// silently matches nothing (this is what shipped an empty news sitemap).
	const posts = await fetchSanity<
		Array<{
			url: string
			publishDate: string
			title: string
			categories: { title: string; slug: { current: string } }[]
		}>
	>({
		query: groq`*[
			_type == 'blog.post'
			&& metadata.noIndex != true
			&& defined(categories[0]->slug.current)
			&& defined(publishDate)
			&& dateTime(select(
				publishDate match '*T*' => publishDate,
				publishDate + 'T00:00:00Z'
			)) > dateTime(now()) - 60 * 60 * 24 * 2
		]|order(publishDate desc){
			'url': (
				$base
				+ select(defined(categories[0]->slug.current) => categories[0]->slug.current + '/', '')
				+ metadata.slug.current
			),
			publishDate,
			title,
			'categories': categories[@->title != null]->{ title, 'slug': slug.current },
		}`,
		params: { base },
	})

	if (!posts?.length) {
		return new Response(
			`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
</urlset>`,
			{
				headers: { 'Content-Type': 'application/xml' },
			},
		)
	}

	const urls = posts
		.map(
			(post) => `	<url>
		<loc>${post.url}</loc>
		<news:news>
			<news:publication>
				<news:name>TRM Sport</news:name>
				<news:language>it</news:language>
			</news:publication>
			<news:publication_date>${post.publishDate}</news:publication_date>
			<news:title>${escapeXml(post.title)}</news:title>
			${post.categories?.[0]?.title ? `<news:keywords>${escapeXml(post.categories[0].title)}</news:keywords>` : ''}
		</news:news>
	</url>`,
		)
		.join('\n')

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urls}
</urlset>`

	return new Response(xml, {
		headers: { 'Content-Type': 'application/xml' },
	})
}

function escapeXml(s: string): string {
	return s
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;')
}
