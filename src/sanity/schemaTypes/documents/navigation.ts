import { defineField, defineType } from 'sanity'
import { VscMap, VscLayoutMenubar, VscLayoutPanelLeft } from 'react-icons/vsc'
import { IoShareSocialOutline } from 'react-icons/io5'
import { count } from '@/lib/utils'

export default defineType({
	name: 'navigation',
	title: 'Menu',
	icon: VscMap,
	type: 'document',
	fields: [
		defineField({
			name: 'title',
			title: 'Nome del menu',
			type: 'string',
			description:
				'Nome identificativo (es. "Menu Header", "Menu Footer", "Social")',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'items',
			title: 'Voci del menu',
			type: 'array',
			description:
				'Link singoli o gruppi di link. Per il footer, usa "Gruppo di link" per creare le colonne (es. Esplora, Competizioni, ecc.)',
			of: [{ type: 'link' }, { type: 'link.list' }],
		}),
	],
	preview: {
		select: {
			title: 'title',
			items: 'items',
		},
		prepare: ({ title, items }) => {
			const t = title?.toLowerCase() || ''

			return {
				title,
				subtitle: count(items, 'voce', 'voci'),
				media: t.includes('social')
					? IoShareSocialOutline
					: t.includes('header')
						? VscLayoutMenubar
						: t.includes('footer')
							? VscLayoutPanelLeft
							: null,
			}
		},
	},
})
