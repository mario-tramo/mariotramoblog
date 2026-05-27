import { type SchemaTypeDefinition } from 'sanity'

// documents
import site from './documents/site'
import page from './documents/page'

import blogPost from './documents/blog.post'
import blogCategory from './documents/blog.category'
import blogTag from './documents/blog.tag'
import categoryTemplate from './documents/category-template'
import articleTemplate from './documents/article-template'
import legal from './documents/legal'
import redirect from './documents/redirect'
import mediaAsset from './documents/media-asset'

// miscellaneous
import announcement from './misc/announcement'
import person from './misc/person'

// objects
import cta from './objects/cta'
import icon from './objects/icon'
import img from './objects/img'
import link from './objects/link'
import linkList from './objects/link.list'
import metadata from './objects/metadata'
import heroSlide from './objects/hero-slide'
import moduleOptions from './objects/module-options'
import collectionFilter from './objects/collection-filter'

// blocks
import { quoteBlock, videoEmbed, socialEmbed } from './blocks'

// modules
import articleCarousel from './modules/article-carousel'
import accordionList from './modules/accordion-list'
import blogFrontpage from './modules/blog-frontpage'
import blogList from './modules/blog-list'
import blogPostContent from './modules/blog-post-content'
import breadcrumbs from './modules/breadcrumbs'
import callout from './modules/callout'
import cardList from './modules/card-list'
import customHtml from './modules/custom-html'
import divider from './modules/divider'
import hero from './modules/hero'
import richtextModule from './modules/richtext-module'
import searchModule from './modules/search-module'
import newsletterBlock from './modules/newsletter-block'
import layoutBlock from './modules/layout-block'
import standings from './modules/standings'
import postsFeed from './modules/posts-feed'
import teamGrid from './modules/team-grid'

export const schemaTypes: SchemaTypeDefinition[] = [
	// documents
	site,
	page,
	blogPost,
	blogCategory,
	blogTag,
	categoryTemplate,
	articleTemplate,
	legal,

	mediaAsset,

	// miscellaneous
	announcement,
	redirect,
	person,

	// objects
	cta,
	icon,
	img,
	link,
	linkList,
	heroSlide,
	metadata,
	moduleOptions,
	collectionFilter,

	// blocks
	quoteBlock,
	videoEmbed,
	socialEmbed,

	// modules
	articleCarousel,
	accordionList,
	blogFrontpage,
	blogList,
	blogPostContent,
	breadcrumbs,
	callout,
	cardList,
	customHtml,
	divider,
	hero,
	richtextModule,
	layoutBlock,
	searchModule,
	newsletterBlock,
	standings,
	postsFeed,
	teamGrid,
]
