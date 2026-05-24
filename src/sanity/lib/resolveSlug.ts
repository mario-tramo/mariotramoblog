export default function resolveSlug({
	_type,
	internal,
	params,
	external,
	categorySlug,
}: {
	// internal
	_type?: string
	internal?: string
	params?: string
	// external
	external?: string
	// category slug for blog posts
	categorySlug?: string
}) {
	if (external) return external

	if (internal) {
		if (_type === 'blog.category') {
			return `/${internal}`
		}

		if (_type === 'blog.post') {
			const segment = categorySlug ? `/${categorySlug}/` : '/'
			const path = internal === 'index' ? null : internal
			return [segment, path, params].filter(Boolean).join('')
		}

		const segment = _type === 'legal' ? '/legal/' : '/'
		const path = internal === 'index' ? null : internal

		return [segment, path, params].filter(Boolean).join('')
	}

	return undefined
}
