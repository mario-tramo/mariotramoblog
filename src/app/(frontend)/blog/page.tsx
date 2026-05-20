import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Modules from '@/ui/modules'
import processMetadata from '@/lib/processMetadata'
import { collectionPageJsonLd } from '@/lib/jsonLd'
import { fetchSanityLive } from '@/sanity/lib/fetch'
import { groq } from 'next-sanity'
import { BLOG_DIR } from '@/lib/env'
import {
	MODULES_QUERY,
	TRANSLATIONS_QUERY,
} from '@/sanity/lib/queries'

export default async function Page({ searchParams }: Props) {
	const page = await getPage()
	if (!page) notFound()
	const resolvedSearchParams = await searchParams
	return (
		<>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(
						collectionPageJsonLd(page.metadata.title, page.metadata.description),
					),
				}}
			/>
			<Modules modules={page.modules} page={page} searchParams={resolvedSearchParams} />
		</>
	)
}

export async function generateMetadata(): Promise<Metadata> {
	const page = await getPage()
	if (!page) notFound()
	return processMetadata(page)
}

async function getPage() {
	return await fetchSanityLive<Sanity.Page>({
		query: groq`*[
			_type == 'page'
			&& metadata.slug.current == $slug
		][0]{
			...,
			modules[]{ ${MODULES_QUERY} },
			metadata {
				...,
				'ogimage': image.asset->url + '?w=1200'
			},
			${TRANSLATIONS_QUERY},
		}`,
		params: { slug: BLOG_DIR },
	})
}

type Props = {
	searchParams: Promise<Record<string, string | string[] | undefined>>
}
