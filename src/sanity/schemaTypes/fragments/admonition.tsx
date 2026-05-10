import { defineArrayMember, defineField } from 'sanity'
import { VscInfo, VscLightbulb, VscReport, VscWarning } from 'react-icons/vsc'
import { getBlockText } from '@/lib/utils'

export default defineArrayMember({
	name: 'admonition',
	type: 'object',
	icon: VscReport,
	title: 'Avviso',
	fields: [
		defineField({
			name: 'tone',
			title: 'Tipo di avviso',
			type: 'string',
			description: 'Colore e icona dell\'avviso',
			options: {
				list: [
					{ title: '🔵 Nota', value: 'note' },
					{ title: '🟣 Importante', value: 'important' },
					{ title: '🟢 Suggerimento', value: 'tip' },
					{ title: '🟠 Avvertimento', value: 'warning' },
					{ title: '🔴 Attenzione', value: 'caution' },
				],
			},
			initialValue: 'note',
		}),
		defineField({
			name: 'title',
			title: 'Titolo',
			type: 'string',
			description: "Titolo dell'avviso (facoltativo)",
		}),
		defineField({
			name: 'content',
			title: 'Testo',
			type: 'array',
			description: "Contenuto dell'avviso",
			of: [{ type: 'block' }],
			validation: (Rule) => Rule.required().error('Il testo dell\'avviso è obbligatorio'),
		}),
	],
	preview: {
		select: {
			title: 'title',
			content: 'content',
			tone: 'tone',
		},
		prepare: ({ title, content, tone }) => ({
			title,
			subtitle: getBlockText(content),
			media:
				tone === 'note' ? (
					<VscInfo />
				) : tone === 'important' ? (
					<VscReport />
				) : tone === 'tip' ? (
					<VscLightbulb />
				) : tone === 'warning' || tone === 'caution' ? (
					<VscWarning />
				) : null,
		}),
	},
})
