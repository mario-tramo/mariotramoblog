import { notFound, permanentRedirect } from 'next/navigation'
import JsonLd from '@/ui/primitives/JsonLd'
import Modules from '@/ui/modules'
import ViewTracker from '@/ui/ViewTracker'
import processMetadata from '@/lib/processMetadata'
import {
	webPageJsonLd,
	collectionPageJsonLd,
	breadcrumbJsonLd,
	faqPageJsonLd,
	newsArticleJsonLd,
	personJsonLd,
	organizationJsonLd,
	newsMediaOrganizationJsonLd,
} from '@/lib/jsonLd'
import { getBlockText } from '@/lib/utils'
import resolveUrl from '@/lib/resolveUrl'
import { client } from '@/sanity/lib/client'
import groq from 'groq'
import { fetchSanityLive } from '@/sanity/lib/fetch'
import {
	IMAGE_QUERY,
	MODULES_QUERY,
	TRANSLATIONS_QUERY,
} from '@/sanity/lib/queries'
import { urlFor } from '@/sanity/lib/image'
import { BASE_URL } from '@/lib/env'
import { processSlug } from '@/lib/processSlug'
import errors from '@/lib/errors'

export const revalidate = 60

export default async function Page({ params, searchParams }: Props) {
	const resolvedParams = await params
	const resolvedSearchParams = await searchParams

	const logoUrl = await getSiteLogoUrl()

	// Try page first, then category, then blog post (category/slug)
	const page = await getPage(resolvedParams)
	if (page) {
		const isHomepage = page.metadata.slug?.current === 'index'
		const isAboutPage = page.metadata.slug?.current === 'chi-siamo'
		const socialLinks = isHomepage || isAboutPage
			? await getSocialLinks()
			: undefined
		const faqItems = collectFaqItems(page.modules)

		return (
			<>
				<JsonLd
					data={webPageJsonLd({
						title: page.metadata.title,
						description: page.metadata.description,
						url: resolveUrl(page),
						dateModified: page._updatedAt,
					}, logoUrl)}
				/>
				{faqItems.length > 0 && (
					<JsonLd data={faqPageJsonLd(faqItems)} />
				)}
				{(isHomepage || isAboutPage) && (
					<>
						<JsonLd data={organizationJsonLd(socialLinks, logoUrl)} />
						<JsonLd data={newsMediaOrganizationJsonLd(socialLinks, logoUrl)} />
					</>
				)}
				<Modules modules={page.modules} page={page} searchParams={resolvedSearchParams} />
			</>
		)
	}

	const category = await getCategory(resolvedParams)
	if (category) {
		const catSlug = category.slug.current

		// Inject category slug so blog modules auto-filter
		const mergedSearchParams = {
			...resolvedSearchParams,
			categoria: catSlug,
		}

		// Custom modules on category override the template
		const modules =
			category.modules.length > 0
				? category.modules
				: await getCategoryTemplate()

		// Patch viewAllHref on posts-feed modules when on a category page
		const patchedModules = modules.map((mod) => {
			if (!mod || mod._type !== 'posts-feed') return mod
			const m = mod as Sanity.Module & { viewAllHref?: string; viewAllLabel?: string }
			if (!m.viewAllHref || m.viewAllHref === '/' || m.viewAllHref === '/blog') {
				return { ...m, viewAllHref: `/${catSlug}`, viewAllLabel: m.viewAllLabel || 'Vedi tutti' }
			}
			return m
		})

		const faqItems = collectFaqItems(patchedModules)

		return (
			<>
				{faqItems.length > 0 && (
					<JsonLd data={faqPageJsonLd(faqItems)} />
				)}
				<JsonLd
					data={collectionPageJsonLd(
						category.metadata.title,
						category.metadata.description,
						`${BASE_URL}/${category.metadata.slug.current}`,
						logoUrl,
					)}
				/>
				<JsonLd
					data={breadcrumbJsonLd([
						{ name: 'Home', url: BASE_URL },
						{
							name: category.title,
							url: `${BASE_URL}/${category.metadata.slug.current}`,
						},
					])}
				/>
				<Modules
					modules={patchedModules}
					page={category as unknown as Sanity.Page}
					searchParams={mergedSearchParams}
				/>
			</>
		)
	}

	// Try blog post: /[category-slug]/[post-slug]
	const post = await getPost(resolvedParams)
	if (post) {
		const catSlug = post.categories?.[0]?.slug?.current
		// Redirect to canonical URL if accessed via non-primary category
		if (resolvedParams.slug?.[0] && catSlug && resolvedParams.slug[0] !== catSlug) {
			permanentRedirect(`/${catSlug}/${post.metadata.slug.current}`)
		}
		const faqItems = collectFaqItems(post.modules)
		return (
			<>
				<JsonLd data={newsArticleJsonLd(post, logoUrl)} />
				{faqItems.length > 0 && (
					<JsonLd data={faqPageJsonLd(faqItems)} />
				)}
				<JsonLd
					data={breadcrumbJsonLd([
						{ name: 'Home', url: BASE_URL },
						...(catSlug
							? [
								{
									name: post.categories[0].title,
									url: `${BASE_URL}/${catSlug}`,
								},
							]
							: []),
						{
							name: post.title,
							url: resolveUrl(post),
						},
					])}
				/>
				{post.authors?.map((author) => (
					<JsonLd key={author._id} data={personJsonLd(author)} />
				))}
				<ViewTracker slug={post.metadata.slug.current} />
				<Modules modules={post.modules} post={post} />
			</>
		)
	}

	notFound()
}

export async function generateMetadata({ params, searchParams }: Props) {
	const resolvedParams = await params
	const resolvedSearchParams = await searchParams
	const categoria = resolvedSearchParams?.categoria

	const page = await getPage(resolvedParams)
	if (page) {
		const meta = await processMetadata(page)
		// When ?categoria is present, adjust canonical to the category page
		// to prevent duplicate content between /?categoria=X and /X
		if (categoria && typeof categoria === 'string') {
			const catUrl = `${BASE_URL}/${categoria}`
			return {
				...meta,
				alternates: {
					...meta.alternates,
					canonical: catUrl,
				},
				robots: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
			}
		}
		return meta
	}
	const category = await getCategory(resolvedParams)
	if (category) return processMetadata(category)
	const post = await getPost(resolvedParams)
	if (post) return processMetadata(post)
	notFound()
}

export async function generateStaticParams() {
	const [pageSlugs, categorySlugs, postSlugs] = await Promise.all([
		client.fetch<{ slug: string }[]>(
			groq`*[
				_type == 'page'
				&& defined(metadata.slug.current)
				&& !(metadata.slug.current in ['index'])
				&& metadata.noIndex != true
			]{ 'slug': metadata.slug.current }`,
		),
		client.fetch<{ slug: string }[]>(
			groq`*[
				_type == 'blog.category'
				&& defined(slug.current)
				&& metadata.noIndex != true
			]{ 'slug': slug.current }`,
		),
		client.fetch<{ slug: string; categories: string[] }[]>(
			groq`*[
				_type == 'blog.post'
				&& defined(metadata.slug.current)
				&& metadata.noIndex != true
			]{
				'slug': metadata.slug.current,
				'categories': categories[]->slug.current
			}`,
		),
	])

	// Generate all category/post-slug combinations
	const postParams = postSlugs.flatMap(({ slug, categories }) =>
		categories
			?.filter(Boolean)
			.map((cat) => ({ slug: `${cat}/${slug}` })) ?? [],
	)

	return [...pageSlugs, ...categorySlugs, ...postParams].map(({ slug }) => ({
		slug: slug.split('/'),
	}))
}

async function getPage(params: Params) {
	const { slug, lang } = processSlug(params)

	// Don't try to resolve multi-segment slugs as pages (except lang prefixed)
	if (params.slug && params.slug.length > 1 && !lang) return null
	if (params.slug && lang && params.slug.length > 2) return null

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
		cacheHint: { type: 'page', slug },
		tags: lang ? [`page:lang:${lang}`] : undefined,
	})

	if (slug === 'index' && !page) throw new Error(errors.missingHomepage)

	return page
}

async function getCategory(params: Params) {
	const { slug } = processSlug(params)

	// Categories are single-segment only
	if (params.slug && params.slug.length > 1) return null

	const raw = await fetchSanityLive<Sanity.BlogCategory>({
		query: groq`*[
			_type == 'blog.category'
			&& slug.current == $slug
		][0]{
			...,
			modules[]{ ${MODULES_QUERY} },
			metadata {
				...,
				'ogimage': image.asset->url + '?w=1200'
			},
		}`,
		params: { slug },
		cacheHint: { type: 'blog.category', slug },
	})

	if (!raw) return null

	return {
		...raw,
		modules: raw.modules ?? [],
		metadata: {
			slug: { current: slug },
			title: raw.metadata?.title ?? raw.title,
			description: raw.metadata?.description ?? '',
			noIndex: raw.metadata?.noIndex ?? false,
			...raw.metadata,
		} satisfies Sanity.Metadata,
	}
}

async function getPost(params: Params) {
	// Blog posts require exactly 2 segments: [category-slug, post-slug]
	if (!params.slug || params.slug.length !== 2) return null

	const [categorySlug, postSlug] = params.slug

	const post = await fetchSanityLive<Sanity.BlogPost>({
		query: groq`*[
			_type == 'blog.post'
			&& metadata.slug.current == $postSlug
			&& $categorySlug in categories[]->slug.current
		][0]{
			...,
			'title': coalesce(title, metadata.title),
			body[]{
				...,
				_type == 'image' => {
					${IMAGE_QUERY},
					asset->
				}
			},
			'readTime': round(length(pt::text(body)) / 5 / 180),
			'headings': body[style in ['h2', 'h3']]{
				style,
				'text': pt::text(@)
			},
			'categories': categories[@->title != null]->{ ... },
			'tags': tags[@->title != null]->{ ... },
			// Next article to read in the same primary category: the closest
			// older post by publishDate. Null when this is the oldest in category.
			'nextPost': *[
				_type == 'blog.post'
				&& metadata.slug.current != $postSlug
				&& $categorySlug in categories[]->slug.current
				&& publishDate < ^.publishDate
			] | order(publishDate desc)[0]{
				'title': coalesce(title, metadata.title),
				'slug': metadata.slug.current
			},
			'authors': authors[]->{
				...,
				slug,
				'articleCount': count(*[_type == 'blog.post' && ^._id in authors[]._ref])
			},
			metadata {
				...,
				'ogimage': image.asset->url + '?w=1200'
			},
			${TRANSLATIONS_QUERY},
		}`,
		params: { postSlug, categorySlug },
		cacheHint: { type: 'blog.post', slug: postSlug },
		tags: [`category:${categorySlug}`],
	})

	if (!post) return null

	const modules = await getArticleTemplate()

	return { ...post, modules } as Sanity.BlogPost & { modules: Sanity.Module[] }
}

type Params = { slug?: string[] }

type Props = {
	params: Promise<Params>
	searchParams: Promise<Record<string, string | string[] | undefined>>
}

async function getSiteLogoUrl(): Promise<string | undefined> {
	const site = await fetchSanityLive<{ logo?: Sanity.Image }>({
		query: groq`*[_id == 'site'][0]{ logo }`,
	})
	if (!site?.logo?.asset) return undefined
	return urlFor(site.logo).width(512).height(512).url()
}

async function getSocialLinks(): Promise<string[]> {
	const site = await fetchSanityLive<{ socialLinks?: { external?: string }[] }>({
		query: groq`*[_id == 'site'][0]{ socialLinks[]{ external } }`,
	})
	return (
		site?.socialLinks
			?.map((l) => l.external)
			.filter((url): url is string => !!url) ?? []
	)
}

async function getArticleTemplate(): Promise<Sanity.Module[]> {
	const template = await fetchSanityLive<{ modules?: Sanity.Module[] }>({
		query: groq`*[_type == 'article-template'][0]{
			modules[]{ ${MODULES_QUERY} }
		}`,
	})

	return template?.modules ?? []
}

async function getCategoryTemplate(): Promise<Sanity.Module[]> {
	const template = await fetchSanityLive<{ modules?: Sanity.Module[] }>({
		query: groq`*[_type == 'category-template'][0]{
			modules[]{ ${MODULES_QUERY} }
		}`,
	})

	return template?.modules ?? []
}

type AccordionFaqModule = Sanity.Module & {
	generateSchema?: boolean
	items?: { summary?: string; content?: Parameters<typeof getBlockText>[0] }[]
}

type LayoutBlockModule = Sanity.Module & {
	column1?: Sanity.Module[]
	column2?: Sanity.Module[]
	column3?: Sanity.Module[]
}

/**
 * Walks the module tree (descending into layout-block columns) and collects
 * FAQ question/answer pairs from accordion-list modules that opted into schema
 * markup. Used to emit a single, centralized FAQPage JSON-LD per page.
 */
function collectFaqItems(
	modules?: Sanity.Module[],
): { question: string; answer: string }[] {
	if (!modules) return []

	return modules.flatMap((module) => {
		if (!module) return []

		if (module._type === 'accordion-list') {
			const accordion = module as AccordionFaqModule
			if (!accordion.generateSchema || !accordion.items) return []
			return accordion.items
				.filter((item) => item?.summary)
				.map((item) => ({
					question: item.summary as string,
					answer: getBlockText(item.content, ' ').trim(),
				}))
		}

		if (module._type === 'layout-block') {
			const block = module as LayoutBlockModule
			return collectFaqItems([
				...(block.column1 ?? []),
				...(block.column2 ?? []),
				...(block.column3 ?? []),
			])
		}

		return []
	})
}
