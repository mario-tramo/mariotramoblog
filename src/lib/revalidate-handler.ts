import { tagsForDocument, SANITY_GLOBAL_TAG } from '@/sanity/lib/cache'

/**
 * Pure revalidation logic for `/api/revalidate`.
 *
 * Sanity webhooks should send `document` whenever possible. The document type
 * lets us invalidate only the affected collections instead of flushing every
 * public Sanity query after each article publish.
 */
export interface RevalidatePayload {
	path?: string
	paths?: string[]
	tags?: string[]
	/** Set `flushAll: true` only for an intentional emergency flush. */
	flushAll?: boolean
	document?: {
		_type?: string | null
		_id?: string | null
		slug?: string | null
		categorySlug?: string | null
	}
}

export interface RevalidateDeps {
	revalidateTag: (
		tag: string,
		profile: string | { [key: string]: number | undefined },
	) => void
	revalidatePath: (path: string, type?: 'layout' | 'page') => void
}

export interface RevalidateOutcome {
	flushedTags: string[]
	paths: string[]
}

function deriveTagsToFlush(payload: RevalidatePayload): string[] {
	const set = new Set<string>()

	for (const tag of payload.tags ?? []) {
		if (typeof tag === 'string' && tag.trim().length > 0) set.add(tag.trim())
	}

	if (payload.document) {
		for (const tag of tagsForDocument(payload.document)) set.add(tag)
	}

	// Preserve the old emergency behavior only when explicitly requested or
	// when a webhook has no document/type information to classify.
	if (payload.flushAll || (!payload.document?._type && !(payload.tags && payload.tags.length > 0))) {
		set.add(SANITY_GLOBAL_TAG)
	}
	return Array.from(set)
}

function normalisePaths(payload: RevalidatePayload): string[] {
	const out: string[] = []
	if (typeof payload.path === 'string' && payload.path.startsWith('/')) out.push(payload.path)
	if (Array.isArray(payload.paths)) {
		for (const path of payload.paths) {
			if (typeof path === 'string' && path.startsWith('/') && !out.includes(path)) {
				out.push(path)
			}
		}
	}
	return out
}

function affectsLayout(payload: RevalidatePayload): boolean {
	const type = payload.document?._type
	return !type || type === 'site' || type === 'announcement' || type === 'redirect'
}

/**
 * Add the routes that *depend on* a changed document but are not necessarily
 * in the webhook's own `path` (which usually only names the document itself).
 *
 * Without these, a newly published post would only revalidate its own article
 * route; the homepage feed and the category section could keep serving the
 * previous render — which is exactly the "section shows empty/stale" bug. The
 * push is strictly conditional so partial webhook payloads still do the right
 * thing and unknown types are ignored.
 */
function addAggregatePaths(
	doc: RevalidatePayload['document'],
	paths: string[],
): void {
	if (!doc?._type) return

	const add = (path: string) => {
		if (path.startsWith('/') && !paths.includes(path)) paths.push(path)
	}

	switch (doc._type) {
		case 'blog.post':
			// Homepage feed, the category section, and the canonical article.
			add('/')
			if (doc.categorySlug) add(`/${doc.categorySlug}`)
			if (doc.categorySlug && doc.slug) add(`/${doc.categorySlug}/${doc.slug}`)
			break
		case 'blog.category':
			add('/')
			if (doc.slug) add(`/${doc.slug}`)
			break
		case 'person':
			if (doc.slug) add(`/autori/${doc.slug}`)
			break
		case 'page':
			add(doc.slug === 'index' ? '/' : `/${doc.slug}`)
			break
	}
}

export function processRevalidation(
	payload: RevalidatePayload,
	deps: RevalidateDeps,
): RevalidateOutcome {
	const flushedTags = deriveTagsToFlush(payload)

	for (const tag of flushedTags) deps.revalidateTag(tag, { expire: 0 })

	const paths = normalisePaths(payload)
	const layoutInvalidated = affectsLayout(payload)
	if (layoutInvalidated) deps.revalidatePath('/', 'layout')

	addAggregatePaths(payload.document, paths)
	for (const path of paths) deps.revalidatePath(path)

	return {
		flushedTags,
		paths: layoutInvalidated && !paths.includes('/') ? ['/', ...paths] : paths,
	}
}
