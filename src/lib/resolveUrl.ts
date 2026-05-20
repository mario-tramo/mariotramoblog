import { BLOG_DIR } from './env'
import { DEFAULT_LANG } from './i18n'
import { stegaClean } from 'next-sanity'

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
			base && process.env.NEXT_PUBLIC_BASE_URL,
			lang_,
			`/${BLOG_DIR}`,
			catSlug ? `?categoria=${catSlug}` : '',
		]
			.filter(Boolean)
			.join('')
	}

	const segment =
		page?._type === 'blog.post'
			? `/${BLOG_DIR}/`
			: page?._type === 'legal'
				? '/legal/'
				: '/'
	const lang = language && language !== DEFAULT_LANG ? `/${language}` : ''
	const slug = page?.metadata?.slug?.current
	const path = slug === 'index' ? null : slug

	return [
		base && process.env.NEXT_PUBLIC_BASE_URL,
		lang,
		segment,
		path,
		stegaClean(params),
	]
		.filter(Boolean)
		.join('')
}
