import type { Metadata } from 'next'
import groq from 'groq'
import { fetchSanityLive } from '@/sanity/lib/fetch'
import { MODULES_QUERY } from '@/sanity/lib/queries'
import Modules from './Modules6'

export const revalidate = 3600

export const metadata: Metadata = {
	title: 'Home 6',
	robots: { index: false, follow: false },
}

/**
 * Design-variant homepage (v6): renders the same Sanity `index` document as
 * `/`, but through the home6-local components (themed section bands, rail +
 * carousel layout, v6 cards). The `.v6` wrapper re-scopes the color tokens —
 * see the `.v6` block in app.css.
 */
export default async function Home6Page() {
	const page = await fetchSanityLive<Sanity.Page>({
		query: groq`*[
			_type == 'page'
			&& metadata.slug.current == 'index'
		][0]{
			...,
			modules[]{ ${MODULES_QUERY} },
		}`,
		params: {},
		tags: ['sanity:sitemap'],
	})

	if (!page) return null

	return (
		<div className="v6 bg-canvas text-ink">
			<Modules modules={page.modules} page={page} searchParams={{}} />
		</div>
	)
}
