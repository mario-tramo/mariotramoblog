import { getSite } from '@/sanity/lib/queries'
import resolveUrl from '@/lib/resolveUrl'
import { stegaClean } from 'next-sanity'
import HeaderContent from './HeaderContent'
import type { NavItem } from './HeaderContent'

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

	const navItems: NavItem[] = (headerLinks ?? []).flatMap((item) => {
		if (item._type === 'link') {
			const resolved = resolveLink(item as Sanity.Link)
			return resolved ? [resolved] : []
		}

		if (item._type === 'link.list') {
			const list = item as Sanity.LinkList
			const parent = resolveLink(list.link)
			const children = (list.links ?? [])
				.map(resolveLink)
				.filter((l): l is { label: string; href: string } => l !== null)

			return [
				{
					label: parent?.label ?? '',
					href: parent?.href ?? '#',
					children: children.length > 0 ? children : undefined,
				},
			]
		}

		return []
	})

	const ctaItems = (ctas ?? []).flatMap((cta) => {
		const resolved = resolveLink(cta.link)
		return resolved ? [resolved] : []
	})

	return <HeaderContent navItems={navItems} ctas={ctaItems} />
}
