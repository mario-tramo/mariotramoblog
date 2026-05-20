import { fetchSanityLive } from './fetch'
import { groq } from 'next-sanity'
import errors from '@/lib/errors'
import { BLOG_DIR } from '@/lib/env'

export const LINK_QUERY = groq`
	...,
	internal->{
		_type,
		title,
		metadata,
		slug
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
	_type == 'article-carousel' => { filteredCategory-> },
	_type == 'blog-list' => { filteredCategory-> },
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
	_type == 'article-carousel' => { filteredCategory-> },
	_type == 'blog-frontpage' => {
		slides[]{
			...,
			author->,
			cta{ ${CTA_QUERY} },
			'imageUrl': image.asset->url,
			'lqip': image.asset->metadata.lqip,
		}
	},
	_type == 'blog-list' => { filteredCategory-> },
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
	})

	if (!site) throw new Error(errors.missingSiteSettings)

	return site
}

export async function getTranslations() {
	return await fetchSanityLive<Sanity.Translation[]>({
		query: groq`*[_type in ['page', 'blog.post'] && defined(language)]{
			'slug': '/' + select(
				_type == 'blog.post' => '${BLOG_DIR}/' + metadata.slug.current,
				metadata.slug.current != 'index' => metadata.slug.current,
				''
			),
			'translations': *[_type == 'translation.metadata' && references(^._id)].translations[].value->{
				'slug': '/' + select(
					_type == 'blog.post' => '${BLOG_DIR}/' + language + '/' + metadata.slug.current,
					metadata.slug.current != 'index' => language + '/' + metadata.slug.current,
					language
				),
				_type == 'blog.post' => {
					'slugBlogAlt': '/' + language + '/${BLOG_DIR}/' + metadata.slug.current
				},
				language
			}
		}`,
	})
}
