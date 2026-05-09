import { defineField, defineType } from 'sanity'
import { VscPin, VscCalendar } from 'react-icons/vsc'
import { getBlockText } from '@/lib/utils'

export default defineType({
	name: 'announcement',
	title: 'Annuncio',
	icon: VscPin,
	type: 'document',
	fieldsets: [{ name: 'schedule', title: 'Programmazione', options: { columns: 2 } }],
	fields: [
		defineField({
			name: 'content',
			title: 'Contenuto',
			type: 'array',
			description: "Testo dell'annuncio mostrato in cima al sito",
			of: [
				{
					type: 'block',
					styles: [{ title: 'Normale', value: 'normal' }],
				},
			],
		}),
		defineField({
			name: 'cta',
			title: 'Call-to-action',
			type: 'link',
			description: "Link o pulsante collegato all'annuncio",
		}),
		defineField({
			name: 'start',
			title: 'Inizio',
			type: 'datetime',
			description: 'Data e ora di inizio visualizzazione',
			fieldset: 'schedule',
		}),
		defineField({
			name: 'end',
			title: 'Fine',
			type: 'datetime',
			description: 'Data e ora di fine visualizzazione',
			fieldset: 'schedule',
		}),
	],
	preview: {
		select: {
			content: 'content',
			cta: 'cta.label',
			start: 'start',
			end: 'end',
		},
		prepare: ({ content, cta, start, end }) => ({
			title: getBlockText(content),
			subtitle: cta,
			media: (start || end) && VscCalendar,
		}),
	},
})
