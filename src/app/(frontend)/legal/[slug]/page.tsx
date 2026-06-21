import { notFound } from 'next/navigation'
import processMetadata from '@/lib/processMetadata'
import { client } from '@/sanity/lib/client'
import { fetchSanityLive } from '@/sanity/lib/fetch'
import { groq } from 'next-sanity'
import { IMAGE_QUERY, TRANSLATIONS_QUERY } from '@/sanity/lib/queries'
import Content from '@/ui/modules/RichtextModule/Content'
import { BASE_URL } from '@/lib/env'

export default async function LegalPage({ params }: Props) {
	const page = await getPage(await params)
	if (!page) notFound()

	const url = `${BASE_URL}/legal/${page.metadata.slug?.current}`

	const jsonLd = {
		'@context': 'https://schema.org',
		'@type': 'WebPage',
		name: page.metadata.title,
		description: page.metadata.description,
		url,
		inLanguage: 'it',
		dateModified: page.lastUpdated || page._updatedAt,
		isPartOf: {
			'@type': 'WebSite',
			name: 'Trm Sport',
			url: BASE_URL,
		},
	}

	return (
		<>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>
			<article className="section space-y-8 py-12">
				<header className="space-y-4 text-center">
					<h1 className="h1 text-balance">{page.metadata.title}</h1>
					{page.lastUpdated && (
						<p className="text-sm text-gray-500">
							Ultimo aggiornamento:{' '}
							{new Date(page.lastUpdated).toLocaleDateString('it-IT', {
								year: 'numeric',
								month: 'long',
								day: 'numeric',
							})}
						</p>
					)}
				</header>

				<Content
					value={page.body}
					className="grid max-w-screen-md"
				/>
			</article>
		</>
	)
}

export async function generateMetadata({ params }: Props) {
	const page = await getPage(await params)
	if (!page) notFound()
	return processMetadata(page)
}

export async function generateStaticParams() {
		const slugs = await client.fetch<string[]>(
		groq`*[_type == 'legal' && defined(metadata.slug.current) && metadata.noIndex != true].metadata.slug.current`,
	)

	return slugs.map((slug) => ({ slug }))
}

async function getPage(params: Params) {
	return await fetchSanityLive<Sanity.LegalPage>({
		query: groq`*[
			_type == 'legal'
			&& metadata.slug.current == $slug
		][0]{
			...,
			body[]{
				...,
				_type == 'image' => {
					${IMAGE_QUERY},
					asset->
				}
			},
			metadata {
				...,
				'ogimage': image.asset->url + '?w=1200'
			},
			${TRANSLATIONS_QUERY},
		}`,
		params: { slug: params.slug },
	})
}

type Params = { slug: string }

type Props = {
	params: Promise<Params>
}
