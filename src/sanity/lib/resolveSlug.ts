import { BLOG_DIR } from '@/lib/env'

export default function resolveSlug({
	_type,
	internal,
	params,
	external,
}: {
	// internal
	_type?: string
	internal?: string
	params?: string
	// external
	external?: string
}) {
	if (external) return external

	if (internal) {
		if (_type === 'blog.category') {
			return `/${BLOG_DIR}?categoria=${internal}`
		}

		const segment =
			_type === 'blog.post'
				? `/${BLOG_DIR}/`
				: _type === 'legal'
					? '/legal/'
					: '/'
		const path = internal === 'index' ? null : internal

		return [segment, path, params].filter(Boolean).join('')
	}

	return undefined
}
