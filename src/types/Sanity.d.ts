import type { SanityImageObject } from '@sanity/image-url/lib/types/types'
import type { SanityAssetDocument, SanityDocument } from 'next-sanity'
import type { PortableTextBlock } from '@portabletext/react'

declare global {
	namespace Sanity {
		// documents

		interface Site extends SanityDocument {
			title: string
			logo?: Image
			blurb?: PortableTextBlock[]
			copyright?: PortableTextBlock[]
			ogimage?: string
			// header
			headerLinks?: (Link | LinkList)[]
			ctas?: CTA[]
			// footer
			footerLinks?: LinkList[]
			socialLinks?: Link[]
			showNewsletter?: boolean
			// misc
			announcements?: Announcement[]
		}

		// pages

		interface PageBase extends SanityDocument {
			title?: string
			metadata: Metadata
			readonly language?: string
		}

		interface Page extends PageBase {
			readonly _type: 'page'
			modules?: Module[]
		}

		interface Translation {
			slug: string
			translations?: {
				slug: string
				slugBlogAlt?: string
				language: string
			}[]
		}


		interface LegalPage extends PageBase {
			readonly _type: 'legal'
			body: PortableTextBlock[]
			lastUpdated?: string
		}

		interface BlogPost extends PageBase {
			readonly _type: 'blog.post'
			title: string
			body: PortableTextBlock[]
			readTime: number
			headings?: { style: string; text: string }[]
			categories: BlogCategory[]
			authors: Person[]
			featured: boolean
			hideTableOfContents: boolean
			publishDate: string
			publishAt?: string
			tags?: BlogTag[]
			preferredSourceBanner?: PreferredSourceBanner
			/** Next article in the same (primary) category, older by publishDate. */
			nextPost?: { title: string; slug: string } | null
		}

		interface PreferredSourceBanner {
			enabled?: boolean
			position?: 'firstParagraph' | 'middle' | 'end'
		}

		interface BlogCategory extends SanityDocument {
			title: string
			slug: { current: string }
			color?: string
			metadata?: Metadata
			modules?: Module[]
		}

		interface BlogTag extends SanityDocument {
			title: string
			slug: { current: string }
		}

		// miscellaneous

		interface Announcement extends SanityDocument {
			content: PortableTextBlock[]
			cta?: Link
			start?: string
			end?: string
		}

		interface Person extends SanityDocument {
			name: string
			slug?: { current: string }
			image?: Image
			bio?: string
			socialLink?: string
			articleCount?: number
		}

		// objects

		interface Code {
			readonly _type: 'code'
			language: string
			code: string
			filename?: string
			highlightedLines?: number[]
		}

		interface CTA {
			readonly _type?: 'cta'
			_key?: string
			link?: Link
			style?: string
		}

		interface NewsletterBlock extends Module {
			variant?: 'inline' | 'hero' | 'compact'
			title?: string
			description?: string
		}

		interface Standings extends Module<'standings'> {
			competition?: 'SA' | 'PL' | 'PD' | 'BL1' | 'FL1' | 'CL'
			mobileRows?: '5' | '10' | 'all'
			desktopRows?: '5' | '10' | 'all'
		}

		interface EditorialBanner extends Module<'editorial-banner'> {
			preset?: string
			category?: string
			title?: string
			subtitle?: string
			author?: string
			timeAgo?: string
			ctaText?: string
			ctaLink?: Link
		}

		interface CustomHTML extends Module<'custom-html'> {
			className?: string
			html?: {
				code: string
			}
		}

		interface Icon {
			readonly _type: 'icon'
			image?: Image
			ic0n?: string
			size?: string
		}

		interface HeroSlide {
			_key: string
			title: string
			description?: string
			author?: Person
			cta: CTA
			image: Image
			imageUrl: string
			lqip?: string
		}

		interface Img {
			readonly _type: 'img'
			image: Image
			responsive?: {
				image: Image
				media: string
			}[]
			alt?: string
			loading?: 'lazy' | 'eager'
		}

		interface Image extends SanityAssetDocument {
			alt: string
			loading: 'lazy' | 'eager'
		}

		interface Link {
			readonly _type: 'link'
			label: string
			type: 'internal' | 'external'
			internal?: Page | BlogPost | BlogCategory | LegalPage
			external?: string
			params?: string
		}

		interface LinkList {
			readonly _type: 'link.list'
			link?: Link
			links?: Link[]
		}

		interface Metadata {
			slug: { current: string }
			title: string
			description: string
			image?: Image
			ogimage?: string
			keywords?: string[]
			noIndex: boolean
			canonicalUrl?: string
		}

		interface Module<T = string> {
			_type: T
			_key: string
			options?: {
				hidden?: boolean
				uid?: string
				background?: 'none' | 'surface' | 'contrast' | 'contrast-gradient' | 'calcio' | 'tennis' | 'motori' | 'altri-sport' | 'betting' | 'custom'
				customBgColor?: string
				fullBleed?: boolean
			}
		}

		interface LayoutBlock extends Module<'layout-block'> {
			layout: '1' | '2' | '2-wide-left' | '2-wide-right' | '3' | '3-wide-center'
			verticalAlign?: 'start' | 'center' | 'end' | 'stretch'
			gap?: 'none' | 'small' | 'medium' | 'large'
			background?: 'none' | 'surface' | 'accent' | 'dark' | 'custom'
			customBgColor?: string
			fullBleed?: boolean
			paddingY?: 'none' | 'small' | 'medium' | 'large'
			rounded?: boolean
			column1?: Module[]
			column2?: Module[]
			column3?: Module[]
		}
	}
}

export {}
