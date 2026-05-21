export type CollectionFilter = {
	field: 'category' | 'tag' | 'author'
	mode: 'static' | 'dynamic'
	staticValue?: string
	urlParam?: string
	fallback?: string
}

export type ResolvedFilter = {
	field: 'category' | 'tag' | 'author'
	value: string
}

/**
 * Maps filter fields to their GROQ path expressions on blog.post documents.
 */
const FIELD_GROQ_MAP: Record<CollectionFilter['field'], string> = {
	category: 'categories[]->.slug.current',
	tag: 'tags[]->.slug.current',
	author: 'author->.slug.current',
}

/**
 * Resolves collection filter configs into final filter values,
 * reading from URL params (query or route) with fallback support.
 */
export function resolveCollectionFilters(
	filters: CollectionFilter[] | undefined,
	params: {
		searchParams?: Record<string, string | string[] | undefined>
		routeParams?: Record<string, string | string[] | undefined>
	} = {},
): ResolvedFilter[] {
	if (!filters?.length) return []

	return filters.reduce<ResolvedFilter[]>((resolved, filter) => {
		let value: string | undefined

		if (filter.mode === 'static') {
			value = filter.staticValue
		} else {
			// Dynamic mode: read from URL params
			const raw =
				params.searchParams?.[filter.urlParam || ''] ??
				params.routeParams?.[filter.urlParam || '']

			const urlValue = Array.isArray(raw) ? raw[0] : raw

			value = urlValue || filter.fallback || undefined
		}

		if (value) {
			resolved.push({ field: filter.field, value })
		}

		return resolved
	}, [])
}

/**
 * Builds GROQ filter conditions from resolved filters.
 * Returns a string to be inserted into GROQ `*[... && <conditions>]`.
 */
export function buildGroqFilterConditions(
	resolvedFilters: ResolvedFilter[],
): string {
	return resolvedFilters
		.map((f) => {
			const groqPath = FIELD_GROQ_MAP[f.field]
			// For array fields (categories, tags) use `in`, for single ref (author) use `==`
			if (f.field === 'category' || f.field === 'tag') {
				return `&& $filter_${f.field} in ${groqPath}`
			}
			return `&& ${groqPath} == $filter_${f.field}`
		})
		.join('\n')
}

/**
 * Builds the GROQ params object for resolved filters.
 */
export function buildGroqFilterParams(
	resolvedFilters: ResolvedFilter[],
): Record<string, string> {
	return Object.fromEntries(
		resolvedFilters.map((f) => [`filter_${f.field}`, f.value]),
	)
}
