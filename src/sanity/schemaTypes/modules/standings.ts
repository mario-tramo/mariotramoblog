import { defineField, defineType } from 'sanity'
import { VscSymbolEnum } from 'react-icons/vsc'

export default defineType({
	name: 'standings',
	title: 'Classifica',
	icon: VscSymbolEnum,
	type: 'object',
	groups: [
		{ name: 'content', title: 'Contenuto', default: true },
		{ name: 'options', title: 'Opzioni' },
	],
	fields: [
		defineField({
			name: 'options',
			title: 'Opzioni modulo',
			type: 'module-options',
			description:
				'Impostazioni generali del modulo (visibilita, ancoraggio)',
			group: 'options',
		}),
		defineField({
			name: 'competition',
			title: 'Campionato',
			type: 'string',
			description: 'Seleziona il campionato di cui mostrare la classifica',
			options: {
				list: [
					{ title: 'Serie A', value: 'SA' },
					{ title: 'Premier League', value: 'PL' },
					{ title: 'La Liga', value: 'PD' },
					{ title: 'Bundesliga', value: 'BL1' },
					{ title: 'Ligue 1', value: 'FL1' },
					{ title: 'Champions League', value: 'CL' },
				],
				layout: 'dropdown',
			},
			initialValue: 'SA',
			validation: (Rule) => Rule.required(),
			group: 'content',
		}),
	],
	preview: {
		select: {
			competition: 'competition',
		},
		prepare: ({ competition }) => {
			const names: Record<string, string> = {
				SA: 'Serie A',
				PL: 'Premier League',
				PD: 'La Liga',
				BL1: 'Bundesliga',
				FL1: 'Ligue 1',
				CL: 'Champions League',
			}
			return {
				title: `Classifica ${names[competition] || competition || ''}`,
				subtitle: 'Classifica campionato',
			}
		},
	},
})
