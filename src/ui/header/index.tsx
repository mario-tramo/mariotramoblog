import { getSite } from '@/sanity/lib/queries'
import resolveUrl from '@/lib/resolveUrl'
import { stegaClean } from 'next-sanity'
import HeaderContent from './HeaderContent'

function resolveLink(link?: Sanity.Link): { label: string; href: string } | null {
	if (!link) return null

	const label = stegaClean(link.label) || link.internal?.title || ''

	if (link.type === 'internal' && link.internal) {
		return {
			label,
			href: resolveUrl(link.internal, { base: false, params: link.params }),
		}
	}

	if (link.type === 'external' && link.external) {
		return { label, href: stegaClean(link.external) }
	}

	return null
}

export default async function Header() {
	const { headerLinks, ctas } = await getSite()

	const navItems = (headerLinks ?? []).flatMap((item) => {
		if (item._type === 'link') {
			const resolved = resolveLink(item as Sanity.Link)
			return resolved ? [resolved] : []
		}

		if (item._type === 'link.list') {
			const list = item as Sanity.LinkList
			const resolved = resolveLink(list.link)
			return resolved ? [resolved] : []
		}

		return []
	})

	const ctaItems = (ctas ?? []).flatMap((cta) => {
		const resolved = resolveLink(cta.link)
		if (!resolved) return []
		return [resolved]
	})

	return <HeaderContent navItems={navItems} ctas={ctaItems} />
}
