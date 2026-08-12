import dynamic from 'next/dynamic'
import AccordionList from '@/ui/modules/AccordionList'
import ArticleCarousel from './ArticleCarousel6'
import BlogFrontpage from '@/ui/modules/blog/BlogFrontpage'
import BlogList from './BlogList6'
import BlogPostContent from '@/ui/modules/blog/PostContent'
import Breadcrumbs from '@/ui/modules/Breadcrumbs'
import Callout from '@/ui/modules/Callout'
import CardList from '@/ui/modules/CardList'
import Divider from '@/ui/modules/Divider'
import EditorialBanner from '@/ui/modules/EditorialBanner'
import Hero from '@/ui/modules/Hero'
import RichtextModule from '@/ui/modules/RichtextModule'
import LayoutBlock from './LayoutBlock6'
import PostsFeed from '@/ui/modules/PostsFeed'
import TeamGrid from '@/ui/modules/TeamGrid'
import TrustBar from '@/ui/modules/TrustBar'

// Heavy modules — lazy loaded
const CustomHTML = dynamic(() => import('@/ui/modules/CustomHTML'))
const SearchModule = dynamic(() => import('@/ui/modules/SearchModule'))
const Standings = dynamic(() => import('@/ui/modules/Standings'))
import { createDataAttribute } from 'next-sanity'
import { stegaClean } from '@sanity/client/stega'
import { cn } from '@/lib/utils'
import { bgClasses } from '@/lib/bgClasses'
import { getSectionTheme } from '@/lib/sectionBackgrounds'

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
	'editorial-banner': EditorialBanner,
	hero: Hero,
	'layout-block': LayoutBlock,
	'richtext-module': RichtextModule,
	'search-module': SearchModule,
	standings: Standings,
	'latest-news': PostsFeed, // backward compat — replaced by posts-feed
	'posts-feed': PostsFeed,
	'team-grid': TeamGrid,
	'trust-bar': TrustBar,
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
					isHomepage: page?.metadata?.slug?.current === 'index',
				}
			case 'blog-list':
			case 'article-carousel':
				return { searchParams }
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
			] as React.ComponentType<Record<string, unknown>>

				if (!Component) return null

				// Hardcoded section themes (homepage bands) win over Sanity options.
				// Only at top level — nested modules are themed by LayoutBlock.
				const { pretitle, title } = module as {
					pretitle?: string
					title?: string
				}
				const theme = nested
					? undefined
					: getSectionTheme(pretitle || title)

				const bg = stegaClean(module.options?.background) || 'none'
				const customBg = stegaClean(module.options?.customBgColor)
				const fullBleed = theme
					? true
					: stegaClean(module.options?.fullBleed)
				const hasBg = !!theme || bg !== 'none'
				const isCustomBg = !theme && bg === 'custom' && customBg

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
						data-sanity-id={module._type}
						key={module._key}
					/>
				)

				if (!hasBg || skipWrap) return rendered

				const bgClass = theme
					? theme.bg
					: !isCustomBg
						? bgClasses[bg]
						: ''
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
							<div className={cn('section-full', theme && 'py-10 md:py-14')}>
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
