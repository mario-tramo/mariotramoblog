/**
 * Cache tags shared by the public Sanity cache and the revalidation webhook.
 *
 * Tags are deliberately granular. A global `sanity` tag is kept only as an
 * emergency flush target; normal public queries use collection/document tags.
 */

export type CacheDocHint = {
	type?: string | null
	id?: string | null
	slug?: string | null
}

export type RevalidationDocument = CacheDocHint & {
	_type?: string | null
	_id?: string | null
	slug?: string | null
	categorySlug?: string | null
}

const GLOBAL_TAG = 'sanity'
const FALLBACK_TAG = 'sanity:content'

/** Compose stable, de-duplicated tags for a cached query. */
export function buildTags(
	hint: CacheDocHint | undefined,
	extra: string[] | undefined,
): string[] {
	const tags = new Set<string>()
	if (hint?.type) tags.add(`sanity:type:${hint.type}`)
	if (hint?.id) tags.add(`sanity:doc:${hint.id}`)
	if (hint?.slug) tags.add(`sanity:slug:${hint.slug}`)

	for (const tag of extra ?? []) {
		if (typeof tag === 'string' && tag.trim().length > 0) tags.add(tag.trim())
	}

	// Some low-level modules cannot know their exact document dependency. Keep
	// those entries correct on publish without falling back to the global tag.
	if (tags.size === 0) tags.add(FALLBACK_TAG)
	return Array.from(tags)
}

/**
 * Tags used by a webhook payload. These include collection-level dependencies
 * so feeds and indexes update when a document changes, without flushing every
 * Sanity query in the application.
 */
export function tagsForDocument(doc: RevalidationDocument): string[] {
	const tags = new Set(buildTags(
		{ type: doc._type, id: doc._id, slug: doc.slug },
		undefined,
	))
	tags.add(FALLBACK_TAG)

	switch (doc._type) {
		case 'site':
		case 'announcement':
		case 'redirect':
			tags.add('site-config')
			tags.add('layout')
			break
		case 'page':
			tags.add('sanity:sitemap')
			if (doc.slug === 'index') tags.add('sanity:homepage')
			if (doc.slug === 'blog') tags.add('sanity:rss')
			break
		case 'blog.post':
			tags.add('sanity:posts')
			tags.add('sanity:feed:latest')
			tags.add('sanity:feed:homepage')
			tags.add('sanity:rss')
			tags.add('sanity:sitemap')
			tags.add('sanity:news-sitemap')
			if (doc.categorySlug) tags.add(`sanity:category:${doc.categorySlug}`)
			break
		case 'blog.category':
			tags.add('sanity:categories')
			tags.add('sanity:feed:latest')
			tags.add('sanity:feed:homepage')
			tags.add('sanity:sitemap')
			if (doc.slug) tags.add(`sanity:category:${doc.slug}`)
			break
		case 'person':
			tags.add('sanity:authors')
			tags.add('sanity:sitemap')
			break
		case 'legal':
			tags.add('sanity:sitemap')
			break
		case 'article-template':
			tags.add('sanity:template:article')
			tags.add('sanity:posts')
			break
		case 'category-template':
			tags.add('sanity:template:category')
			tags.add('sanity:categories')
			break
	}

	return Array.from(tags)
}

/** Emergency-only target for an intentional full Sanity cache flush. */
export const SANITY_GLOBAL_TAG = GLOBAL_TAG

/**
 * Safety-net freshness for the Next.js Data Cache (seconds).
 *
 * These are NOT the primary invalidation mechanism: tag-based revalidation via
 * the Sanity webhook (`/api/revalidate`) is what makes published posts appear
 * immediately. They only bound how stale a render can get when a webhook is
 * missed or delayed, so a section that used to go empty/stale for up to an
 * hour is now limited to minutes.
 *
 * The Feed tier is shorter because home/section/post feeds are the hot path
 * for readers (issue: sections showing empty after publishing); the generic
 * default covers everything else (pages, site config, templates).
 *
 * Both tiers are deliberately long: on Vercel every Data Cache expiry+refresh
 * is billed as an ISR write, multiplied by the number of cached queries per
 * page render, so short TTLs here saturate the plan's ISR quota.
 *
 * Lives here (a plain module) so it can be imported by "use server" files too.
 */
export const DEFAULT_REVALIDATE_SECONDS = 3600
export const FEED_REVALIDATE_SECONDS = 900
