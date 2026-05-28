import dynamic from 'next/dynamic'
import AccordionList from './AccordionList'
import ArticleCarousel from './ArticleCarousel'
import BlogFrontpage from './blog/BlogFrontpage'
import BlogList from './blog/BlogList'
import BlogPostContent from './blog/PostContent'
import Breadcrumbs from './Breadcrumbs'
import Callout from './Callout'
import CardList from './CardList'
import Divider from './Divider'
import Hero from './Hero'
import NewsletterBlock from './NewsletterBlock'
import RichtextModule from './RichtextModule'
import LayoutBlock from './LayoutBlock'
import PostsFeed from './PostsFeed'
import TeamGrid from './TeamGrid'

// Heavy modules — lazy loaded
const CustomHTML = dynamic(() => import('./CustomHTML'))
const SearchModule = dynamic(() => import('./SearchModule'))
const Standings = dynamic(() => import('./Standings'))
import { createDataAttribute } from 'next-sanity'
import { stegaClean } from 'next-sanity'
import { cn } from '@/lib/utils'
import { bgClasses } from '@/lib/bgClasses'

const MODULE_MAP = {
	'accordion-list': AccordionList,
	'article-carousel': ArticleCarousel,
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
	standings: Standings,
	'latest-news': PostsFeed, // backward compat — replaced by posts-feed
	'posts-feed': PostsFeed,
	'team-grid': TeamGrid,
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
		const basePath =
			page?.metadata?.slug?.current === 'index' ||
			!page?.metadata?.slug?.current
				? '/'
				: `/${page.metadata.slug.current}`

		switch (module._type) {
			case 'blog-frontpage':
				return {
					searchParams,
					page: Number(searchParams?.page) || 1,
					basePath,
				}
			case 'blog-list':
			case 'article-carousel':
			case 'posts-feed':
				return { searchParams }
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

				const bg = stegaClean(module.options?.background) || 'none'
				const customBg = stegaClean(module.options?.customBgColor)
				const fullBleed = stegaClean(module.options?.fullBleed)
				const hasBg = bg !== 'none'
				const isCustomBg = bg === 'custom' && customBg

				// LayoutBlock handles its own background
				const skipWrap = module._type === 'layout-block'

				const rendered = (
					<Component
						{...module}
						{...getAdditionalProps(module)}
						{...(nested ? { nested: true } : {})}
						{...(hasBg && !skipWrap ? { nested: true } : {})}
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

				if (!hasBg || skipWrap) return rendered

				const bgClass = !isCustomBg ? bgClasses[bg] : ''
				const style = isCustomBg
					? { backgroundColor: customBg }
					: undefined

				if (fullBleed) {
					return (
						<div
							key={module._key}
							className={cn(bgClass)}
							style={style}
						>
							<div className="section">
								{rendered}
							</div>
						</div>
					)
				}

				return (
					<div
						key={module._key}
						className={cn(
							'section',
							bgClass,
							'rounded-2xl',
						)}
						style={style}
					>
						{rendered}
					</div>
				)
			})}
		</>
	)
}
