import AccordionList from './AccordionList'
import BlogFrontpage from './blog/BlogFrontpage'
import BlogList from './blog/BlogList'
import BlogPostContent from './blog/PostContent'
import Breadcrumbs from './Breadcrumbs'
import Callout from './Callout'
import CardList from './CardList'
import CustomHTML from './CustomHTML'
import Divider from './Divider'
import Hero from './Hero'
import NewsletterBlock from './NewsletterBlock'
import RichtextModule from './RichtextModule'
import SearchModule from './SearchModule'
import LayoutBlock from './LayoutBlock'
import SectionLayout from './SectionLayout'
import Standings from './Standings'
import { createDataAttribute } from 'next-sanity'

const MODULE_MAP = {
	'accordion-list': AccordionList,
	'blog-frontpage': BlogFrontpage,
	'blog-list': BlogList,
	'blog-post-content': BlogPostContent,
	breadcrumbs: Breadcrumbs,
	callout: Callout,
	'card-list': CardList,
	'custom-html': CustomHTML,
	divider: Divider,
	hero: Hero,
	'layout-block': LayoutBlock,
	'newsletter-block': NewsletterBlock,
	'richtext-module': RichtextModule,
	'search-module': SearchModule,
	'section-layout': SectionLayout,
	standings: Standings,
} as const

export default function Modules({
	modules,
	page,
	post,
	nested,
	searchParams,
}: {
	modules?: Sanity.Module[]
	page?: Sanity.Page
	post?: Sanity.BlogPost
	nested?: boolean
	searchParams?: Record<string, string | string[] | undefined>
}) {
	const getAdditionalProps = (module: Sanity.Module) => {
		switch (module._type) {
			case 'blog-frontpage':
				return {
					categoria: searchParams?.categoria as string | undefined,
					page: Number(searchParams?.page) || 1,
				}
			case 'blog-post-content':
				return { post }
			case 'breadcrumbs':
				return { currentPage: post || page }
			default:
				return {}
		}
	}

	return (
		<>
			{modules?.map((module) => {
				if (!module) return null

				const Component = MODULE_MAP[
				module._type as keyof typeof MODULE_MAP
			] as React.ComponentType<any>

				if (!Component) return null

				return (
					<Component
						{...module}
						{...getAdditionalProps(module)}
						{...(nested ? { nested: true } : {})}
						data-sanity={
							!!page?._id &&
							createDataAttribute({
								id: page._id,
								type: page?._type,
								path: `page[_key == "${module._key}"]`,
							}).toString()
						}
						key={module._key}
					/>
				)
			})}
		</>
	)
}
