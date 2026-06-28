import { fetchSanityLive } from './fetch'
import groq from 'groq'
import errors from '@/lib/errors'

export const LINK_QUERY = groq`
	...,
	internal->{
		_type,
		title,
		metadata,
		slug,
		'categories': categories[]->{ title, slug, color }
	}
`

export const IMAGE_QUERY = groq`
	...,
	'lqip': @.asset->metadata.lqip
`

export const CTA_QUERY = groq`
	...,
	link{ ${LINK_QUERY} }
`

const COLUMN_MODULES_QUERY = groq`
	...,
	ctas[]{ ..., link{ ${LINK_QUERY} } },
	_type == 'posts-feed' => {
		manualPosts[]->{ _id },
		'filters': filters[]{..., 'staticValue': staticValue->slug.current}
	},
	_type == 'blog-list' => {
		'category': category->slug.current,
		'filters': filters[]{..., 'staticValue': staticValue->slug.current}
	},
	_type == 'blog-frontpage' => {
		'filters': filters[]{..., 'staticValue': staticValue->slug.current}
	},
	_type == 'article-carousel' => {
		'filters': filters[]{..., 'staticValue': staticValue->slug.current}
	},
	_type == 'card-list' => { cards[]{ ..., ctas[]{ ${CTA_QUERY} } } },
	_type == 'hero' => {
		slides[]{ ..., author->, cta{ ${CTA_QUERY} },
			'imageUrl': image.asset->url, 'lqip': image.asset->metadata.lqip }
	},
	_type == 'richtext-module' => {
		content[]{ ..., _type == 'image' => { ${IMAGE_QUERY} } },
		'headings': select(
			tableOfContents => content[style in ['h2', 'h3', 'h4', 'h5', 'h6']]{
				style, 'text': pt::text(@)
			}
		),
	},
`

export const MODULES_QUERY = groq`
	...,
	ctas[]{
		...,
		link{ ${LINK_QUERY} }
	},
	_type == 'blog-frontpage' => {
		slides[]{
			...,
			author->,
			cta{ ${CTA_QUERY} },
			'imageUrl': image.asset->url,
			'lqip': image.asset->metadata.lqip,
		},
		'filters': filters[]{..., 'staticValue': staticValue->slug.current}
	},
	_type == 'posts-feed' => {
		manualPosts[]->{ _id },
		'filters': filters[]{..., 'staticValue': staticValue->slug.current}
	},
	_type == 'blog-list' => {
		'category': category->slug.current,
		'filters': filters[]{..., 'staticValue': staticValue->slug.current}
	},
	_type == 'article-carousel' => {
		'filters': filters[]{..., 'staticValue': staticValue->slug.current}
	},
	_type == 'breadcrumbs' => { crumbs[]{ ${LINK_QUERY} } },
	_type == 'card-list' => {
		cards[]{
			...,
			ctas[]{ ${CTA_QUERY} }
		}
	},
	_type == 'hero' => {
		slides[]{
			...,
			author->,
			cta{ ${CTA_QUERY} },
			'imageUrl': image.asset->url,
			'lqip': image.asset->metadata.lqip,
		}
	},
	_type == 'layout-block' => {
		...,
		column1[]{ ${COLUMN_MODULES_QUERY} },
		column2[]{ ${COLUMN_MODULES_QUERY} },
		column3[]{ ${COLUMN_MODULES_QUERY} },
	},
	_type == 'richtext-module' => {
		content[]{
			...,
			_type == 'image' => { ${IMAGE_QUERY} }
		},
		'headings': select(
			tableOfContents => content[style in ['h2', 'h3', 'h4', 'h5', 'h6']]{
				style,
				'text': pt::text(@)
			}
		),
	},
`


export const TRANSLATIONS_QUERY = groq`
	'translations': *[_type == 'translation.metadata' && references(^._id)].translations[].value->{
		'slug': metadata.slug.current,
		language
	}
`

export async function getSite() {
	const site = await fetchSanityLive<Sanity.Site>({
		query: groq`
			*[_id == 'site'][0]{
				...,
				headerLinks[]{
					${LINK_QUERY},
					link{ ${LINK_QUERY} },
					links[]{ ${LINK_QUERY} }
				},
				ctas[]{ ${CTA_QUERY} },
				footerLinks[]{
					link{ ${LINK_QUERY} },
					links[]{ ${LINK_QUERY} }
				},
				socialLinks[]{ ${LINK_QUERY} },
				'ogimage': ogimage.asset->url
			}
		`,
		cacheHint: { type: 'site', id: 'site' },
		tags: ['site-config'],
	})

	if (!site) throw new Error(errors.missingSiteSettings)

	return site
}

export async function getTranslations() {
	return await fetchSanityLive<Sanity.Translation[]>({
		query: groq`*[_type in ['page', 'blog.post'] && defined(language)]{
			'slug': '/' + select(
				_type == 'blog.post' => coalesce(categories[0]->slug.current + '/', '') + metadata.slug.current,
				metadata.slug.current != 'index' => metadata.slug.current,
				''
			),
			'translations': *[_type == 'translation.metadata' && references(^._id)].translations[].value->{
				'slug': '/' + select(
					_type == 'blog.post' => language + '/' + coalesce(categories[0]->slug.current + '/', '') + metadata.slug.current,
					metadata.slug.current != 'index' => language + '/' + metadata.slug.current,
					language
				),
				language
			}
		}`,
		cacheHint: undefined,
		tags: ['translations', 'site-config'],
	})
}
