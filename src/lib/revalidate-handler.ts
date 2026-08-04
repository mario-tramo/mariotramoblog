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

export function processRevalidation(
	payload: RevalidatePayload,
	deps: RevalidateDeps,
): RevalidateOutcome {
	const flushedTags = deriveTagsToFlush(payload)

	for (const tag of flushedTags) deps.revalidateTag(tag, { expire: 0 })

	const paths = normalisePaths(payload)
	if (affectsLayout(payload)) deps.revalidatePath('/', 'layout')
	for (const path of paths) deps.revalidatePath(path)

	return {
		flushedTags,
		paths: [...(affectsLayout(payload) ? ['/'] : []), ...paths],
	}
}
