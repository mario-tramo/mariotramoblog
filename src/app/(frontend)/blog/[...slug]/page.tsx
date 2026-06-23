import { notFound, permanentRedirect } from 'next/navigation'
import { fetchSanityLive } from '@/sanity/lib/fetch'
import { groq } from 'next-sanity'
import { processSlug } from '@/lib/processSlug'
import type { Metadata } from 'next'

/**
 * Legacy /blog/[slug] route — permanently redirects to /[category]/[slug]
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { slug } = processSlug(await params)
	const post = await fetchSanityLive<{ title?: string }>({
		query: groq`*[
			_type == 'blog.post'
			&& metadata.slug.current == $slug
		][0]{ 'title': coalesce(title, metadata.title) }`,
		params: { slug },
	})
	if (!post) return {}
	return {
		title: post.title || 'Articolo',
		robots: { index: false, follow: false },
	}
}

export default async function Page({ params }: Props) {
	const { slug } = processSlug(await params)

	const post = await fetchSanityLive<{
		slug: string
		categorySlug: string | null
	}>({
		query: groq`*[
			_type == 'blog.post'
			&& metadata.slug.current == $slug
		][0]{
			'slug': metadata.slug.current,
			'categorySlug': categories[0]->slug.current,
		}`,
		params: { slug },
	})

	if (!post) notFound()

	const destination = post.categorySlug
		? `/${post.categorySlug}/${post.slug}`
		: `/${post.slug}`

	permanentRedirect(destination)
}

type Props = {
	params: Promise<{ slug: string[] }>
}
