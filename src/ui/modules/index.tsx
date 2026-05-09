import AccordionList from './AccordionList'
import BlogFrontpage from './blog/BlogFrontpage'
import BlogList from './blog/BlogList'
import BlogPostContent from './blog/PostContent'
import Breadcrumbs from './Breadcrumbs'
import Callout from './Callout'
import CardList from './CardList'
import CustomHTML from './CustomHTML'
import Hero from './Hero'
import HeroSplit from './HeroSplit'
import RichtextModule from './RichtextModule'
import SearchModule from './SearchModule'
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
	hero: Hero,
	'hero.split': HeroSplit,
	'richtext-module': RichtextModule,
	'search-module': SearchModule,
} as const

export default function Modules({
	modules,
	page,
	post,
}: {
	modules?: Sanity.Module[]
	page?: Sanity.Page
	post?: Sanity.BlogPost
}) {
	const getAdditionalProps = (module: Sanity.Module) => {
		switch (module._type) {
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

				const Component = MODULE_MAP[module._type as keyof typeof MODULE_MAP]

				if (!Component) return null

				return (
					<Component
						{...module}
						{...getAdditionalProps(module)}
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
