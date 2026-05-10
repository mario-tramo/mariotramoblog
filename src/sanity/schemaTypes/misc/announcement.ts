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
			title: 'Testo dell\'annuncio',
			type: 'array',
			description: "Testo mostrato nella barra in cima al sito",
			of: [
				{
					type: 'block',
					styles: [{ title: 'Normale', value: 'normal' }],
				},
			],
			validation: (Rule) => Rule.required().error('Il testo dell\'annuncio è obbligatorio'),
		}),
		defineField({
			name: 'cta',
			title: 'Pulsante',
			type: 'link',
			description: "Link o pulsante collegato all'annuncio (facoltativo)",
		}),
		defineField({
			name: 'start',
			title: 'Mostra dal',
			type: 'datetime',
			description: 'Data e ora da cui iniziare a mostrare l\'annuncio (lascia vuoto per mostrarlo subito)',
			fieldset: 'schedule',
		}),
		defineField({
			name: 'end',
			title: 'Nascondi dal',
			type: 'datetime',
			description: 'Data e ora dopo cui nascondere l\'annuncio (lascia vuoto per non scadere mai)',
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
