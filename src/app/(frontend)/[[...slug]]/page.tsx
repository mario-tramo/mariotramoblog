import { notFound } from 'next/navigation'
import Modules from '@/ui/modules'
import processMetadata from '@/lib/processMetadata'
import { webPageJsonLd, collectionPageJsonLd, breadcrumbJsonLd } from '@/lib/jsonLd'
import resolveUrl from '@/lib/resolveUrl'
import { client } from '@/sanity/lib/client'
import { groq } from 'next-sanity'
import { fetchSanityLive } from '@/sanity/lib/fetch'
import {
	MODULES_QUERY,
	TRANSLATIONS_QUERY,
} from '@/sanity/lib/queries'
import { languages } from '@/lib/i18n'
import { BASE_URL, BLOG_DIR } from '@/lib/env'
import errors from '@/lib/errors'

export default async function Page({ params, searchParams }: Props) {
	const resolvedParams = await params
	const resolvedSearchParams = await searchParams

	// Try page first, then category
	const page = await getPage(resolvedParams)
	if (page) {
		return (
			<>
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(
							webPageJsonLd({
								title: page.metadata.title,
								description: page.metadata.description,
								url: resolveUrl(page),
								dateModified: page._updatedAt,
							}),
						),
					}}
				/>
				<Modules modules={page.modules} page={page} searchParams={resolvedSearchParams} />
			</>
		)
	}

	const category = await getCategory(resolvedParams)
	if (category) {
		// Inject category slug so blog modules auto-filter
		const mergedSearchParams = {
			...resolvedSearchParams,
			categoria: category.slug.current,
		}

		// Custom modules on category override the template
		const modules =
			category.modules.length > 0
				? category.modules
				: await getCategoryTemplate()

		return (
			<>
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(
							collectionPageJsonLd(
								category.metadata.title,
								category.metadata.description,
							),
						),
					}}
				/>
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(
							breadcrumbJsonLd([
								{ name: 'Home', url: BASE_URL },
								{ name: 'Blog', url: `${BASE_URL}/${BLOG_DIR}` },
								{
									name: category.title,
									url: `${BASE_URL}/${category.metadata.slug.current}`,
								},
							]),
						),
					}}
				/>
				<Modules
					modules={modules}
					page={category as unknown as Sanity.Page}
					searchParams={mergedSearchParams}
				/>
			</>
		)
	}

	notFound()
}

export async function generateMetadata({ params }: Props) {
	const resolvedParams = await params
	const page = await getPage(resolvedParams)
	if (page) return processMetadata(page)
	const category = await getCategory(resolvedParams)
	if (category) return processMetadata(category)
	notFound()
}

export async function generateStaticParams() {
	const [pageSlugs, categorySlugs] = await Promise.all([
		client.fetch<{ slug: string }[]>(
			groq`*[
				_type == 'page'
				&& defined(metadata.slug.current)
				&& !(metadata.slug.current in ['index'])
			]{ 'slug': metadata.slug.current }`,
		),
		client.fetch<{ slug: string }[]>(
			groq`*[
				_type == 'blog.category'
				&& defined(metadata.slug.current)
			]{ 'slug': metadata.slug.current }`,
		),
	])

	return [...pageSlugs, ...categorySlugs].map(({ slug }) => ({
		slug: slug.split('/'),
	}))
}

async function getPage(params: Params) {
	const { slug, lang } = processSlug(params)

	const page = await fetchSanityLive<Sanity.Page>({
		query: groq`*[
			_type == 'page'
			&& metadata.slug.current == $slug
			${lang ? `&& language == '${lang}'` : ''}
		][0]{
			...,
			modules[]{ ${MODULES_QUERY} },
			metadata {
				...,
				'ogimage': image.asset->url + '?w=1200'
			},
			${TRANSLATIONS_QUERY},
		}`,
		params: { slug },
	})

	if (slug === 'index' && !page) throw new Error(errors.missingHomepage)

	return page
}

async function getCategory(params: Params) {
	const { slug } = processSlug(params)

	const raw = await fetchSanityLive<
		Sanity.BlogCategory & {
			modules?: Sanity.Module[]
			metadata?: Partial<Sanity.Metadata>
		}
	>({
		query: groq`*[
			_type == 'blog.category'
			&& metadata.slug.current == $slug
		][0]{
			...,
			modules[]{ ${MODULES_QUERY} },
			metadata {
				...,
				'ogimage': image.asset->url + '?w=1200'
			},
		}`,
		params: { slug },
	})

	if (!raw) return null

	return {
		...raw,
		modules: raw.modules ?? [],
		metadata: {
			slug: raw.metadata?.slug ?? { current: slug },
			title: raw.metadata?.title ?? raw.title,
			description: raw.metadata?.description ?? '',
			noIndex: raw.metadata?.noIndex ?? false,
			...raw.metadata,
		} satisfies Sanity.Metadata,
	}
}

type Params = { slug?: string[] }

type Props = {
	params: Promise<Params>
	searchParams: Promise<Record<string, string | string[] | undefined>>
}

function processSlug(params: Params) {
	const lang =
		params.slug && languages.includes(params.slug[0])
			? params.slug[0]
			: undefined

	if (params.slug === undefined)
		return {
			slug: 'index',
			lang,
		}

	const slug = params.slug.join('/')

	if (lang) {
		const processed = slug.replace(new RegExp(`^${lang}/?`), '')

		return {
			slug: processed === '' ? 'index' : processed,
			lang,
		}
	}

	return { slug }
}

async function getCategoryTemplate(): Promise<Sanity.Module[]> {
	const template = await fetchSanityLive<{ modules?: Sanity.Module[] }>({
		query: groq`*[_id == 'category-template'][0]{
			modules[]{ ${MODULES_QUERY} }
		}`,
	})

	return template?.modules ?? []
}
