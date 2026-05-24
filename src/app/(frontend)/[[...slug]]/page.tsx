import { notFound } from 'next/navigation'
import Modules from '@/ui/modules'
import ViewTracker from '@/ui/ViewTracker'
import processMetadata from '@/lib/processMetadata'
import {
	webPageJsonLd,
	collectionPageJsonLd,
	breadcrumbJsonLd,
	blogPostingJsonLd,
	personJsonLd,
} from '@/lib/jsonLd'
import resolveUrl from '@/lib/resolveUrl'
import { client } from '@/sanity/lib/client'
import { groq } from 'next-sanity'
import { fetchSanityLive } from '@/sanity/lib/fetch'
import {
	IMAGE_QUERY,
	MODULES_QUERY,
	TRANSLATIONS_QUERY,
} from '@/sanity/lib/queries'
import { BASE_URL } from '@/lib/env'
import { processSlug } from '@/lib/processSlug'
import errors from '@/lib/errors'

export default async function Page({ params, searchParams }: Props) {
	const resolvedParams = await params
	const resolvedSearchParams = await searchParams

	// Try page first, then category, then blog post (category/slug)
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
								`${BASE_URL}/${category.metadata.slug.current}`,
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

	// Try blog post: /[category-slug]/[post-slug]
	const post = await getPost(resolvedParams)
	if (post) {
		const catSlug = post.categories?.[0]?.slug?.current
		return (
			<>
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(blogPostingJsonLd(post)),
					}}
				/>
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(
							breadcrumbJsonLd([
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
							]),
						),
					}}
				/>
				{post.authors?.map((author) => (
					<script
						key={author._id}
						type="application/ld+json"
						dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd(author)) }}
					/>
				))}
				<ViewTracker slug={post.metadata.slug.current} />
				<Modules modules={post.modules} post={post} />
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
			]{ 'slug': metadata.slug.current }`,
		),
		client.fetch<{ slug: string }[]>(
			groq`*[
				_type == 'blog.category'
				&& defined(slug.current)
			]{ 'slug': slug.current }`,
		),
		client.fetch<{ slug: string; categories: string[] }[]>(
			groq`*[
				_type == 'blog.post'
				&& defined(metadata.slug.current)
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

	return await fetchSanityLive<Sanity.BlogPost & { modules: Sanity.Module[] }>({
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
			'authors': select(defined(author) => [author->{
				...,
				'articleCount': count(*[_type == 'blog.post' && author._ref == ^._id])
			}], null),
			metadata {
				...,
				'ogimage': image.asset->url + '?w=1200'
			},
			'modules': (
				*[_type == 'global-module' && path == '*'].before[]{ ${MODULES_QUERY} }
				+ *[_type == 'global-module' && path == 'blog/'].before[]{ ${MODULES_QUERY} }
				+ *[_type == 'global-module' && path == 'blog/'].after[]{ ${MODULES_QUERY} }
				+ *[_type == 'global-module' && path == '*'].after[]{ ${MODULES_QUERY} }
			)[defined(_type)],
			${TRANSLATIONS_QUERY},
		}`,
		params: { postSlug, categorySlug },
	})
}

type Params = { slug?: string[] }

type Props = {
	params: Promise<Params>
	searchParams: Promise<Record<string, string | string[] | undefined>>
}

async function getCategoryTemplate(): Promise<Sanity.Module[]> {
	const template = await fetchSanityLive<{ modules?: Sanity.Module[] }>({
		query: groq`*[_type == 'category-template'][0]{
			modules[]{ ${MODULES_QUERY} }
		}`,
	})

	return template?.modules ?? []
}
