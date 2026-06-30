import { fetchSanityLive } from '@/sanity/lib/fetch'
import groq from 'groq'
import { BASE_URL } from '@/lib/env'

export async function GET() {
	const base = BASE_URL.replace(/\/+$/, '') + '/'

	const posts = await fetchSanityLive<
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
			&& dateTime(_updatedAt) > dateTimeNow() - 60 * 60 * 24 * 2
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
				<news:name>Trm Sport</news:name>
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
