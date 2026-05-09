import { defineField, defineType } from 'sanity'
import { VscMap, VscLayoutMenubar, VscLayoutPanelLeft } from 'react-icons/vsc'
import { IoShareSocialOutline } from 'react-icons/io5'
import { count } from '@/lib/utils'

export default defineType({
	name: 'navigation',
	title: 'Navigazione',
	icon: VscMap,
	type: 'document',
	fields: [
		defineField({
			name: 'title',
			title: 'Nome',
			type: 'string',
			description: 'Nome identificativo del menu (es. "Menu principale", "Menu footer")',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'items',
			title: 'Voci del menu',
			type: 'array',
			description: 'Link e gruppi di link che compongono questo menu',
			of: [{ type: 'link' }, { type: 'link.list' }],
		}),
	],
	preview: {
		select: {
			title: 'title',
			items: 'items',
		},
		prepare: ({ title, items }) => {
			const t = title.toLowerCase()

			return {
				title,
				subtitle: count(items),
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
