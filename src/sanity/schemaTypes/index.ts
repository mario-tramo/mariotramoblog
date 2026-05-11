import { type SchemaTypeDefinition } from 'sanity'

// documents
import site from './documents/site'
import page from './documents/page'
import globalModule from './documents/global-module'
import blogPost from './documents/blog.post'
import blogCategory from './documents/blog.category'
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

// modules
import accordionList from './modules/accordion-list'
import blogFrontpage from './modules/blog-frontpage'
import blogList from './modules/blog-list'
import blogPostContent from './modules/blog-post-content'
import breadcrumbs from './modules/breadcrumbs'
import callout from './modules/callout'
import cardList from './modules/card-list'
import customHtml from './modules/custom-html'
import hero from './modules/hero'
import richtextModule from './modules/richtext-module'
import searchModule from './modules/search-module'
import newsletterBlock from './modules/newsletter-block'
import standings from './modules/standings'

export const schemaTypes: SchemaTypeDefinition[] = [
	// documents
	site,
	page,
	globalModule,
	blogPost,
	blogCategory,
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

	// modules
	accordionList,
	blogFrontpage,
	blogList,
	blogPostContent,
	breadcrumbs,
	callout,
	cardList,
	customHtml,
	hero,
	richtextModule,
	searchModule,
	newsletterBlock,
	standings,
]
