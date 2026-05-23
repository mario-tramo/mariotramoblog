import { languages, type Lang } from '@/lib/i18n'

export function processSlug(params: { slug?: string[] }) {
	const lang =
		params.slug && languages.includes(params.slug[0] as Lang)
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
