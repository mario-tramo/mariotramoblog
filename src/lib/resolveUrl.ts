import { BASE_URL } from './env'
import { DEFAULT_LANG } from './i18n'
import { stegaClean } from '@sanity/client/stega'

export default function resolveUrl(
	page?: Sanity.PageBase | Sanity.BlogCategory,
	{
		base = true,
		params,
		language,
	}: {
		base?: boolean
		params?: string
		language?: string
	} = {},
) {
	if (page?._type === 'blog.category') {
		const catSlug = (page as unknown as Sanity.BlogCategory).slug?.current
		const lang_ = language && language !== DEFAULT_LANG ? `/${language}` : ''
		return [
			base && BASE_URL,
			lang_,
			catSlug ? `/${catSlug}` : '/',
		]
			.filter(Boolean)
			.join('')
	}

	const lang = language && language !== DEFAULT_LANG ? `/${language}` : ''
	const slug = page?.metadata?.slug?.current
	const path = slug === 'index' ? null : slug

	if (page?._type === 'blog.post') {
		const post = page as unknown as Sanity.BlogPost
		const catSlug = post.categories?.[0]?.slug?.current
		const segment = catSlug ? `/${catSlug}/` : '/'
		return [base && BASE_URL, lang, segment, path, stegaClean(params)]
			.filter(Boolean)
			.join('')
	}

	const segment = page?._type === 'legal' ? '/legal/' : '/'

	return [
		base && BASE_URL,
		lang,
		segment,
		path,
		stegaClean(params),
	]
		.filter(Boolean)
		.join('')
}
