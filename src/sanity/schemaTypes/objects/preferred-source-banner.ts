import { defineType } from 'sanity'

export default defineType({
	name: 'preferredSourceBanner',
	title: 'Google Preferred Source Banner',
	type: 'object',
	fields: [
		{
			name: 'enabled',
			title: 'Mostra banner',
			description:
				'Mostra il banner "Aggiungi TRMsport tra i preferiti su Google" nell\'articolo',
			type: 'boolean',
			initialValue: true,
		},
		{
			name: 'position',
			title: 'Posizione',
			description: 'Dove mostrare il banner nel corpo dell\'articolo',
			type: 'string',
			options: {
				list: [
					{ title: 'Dopo il primo paragrafo', value: 'firstParagraph' },
					{ title: 'A metà articolo', value: 'middle' },
					{ title: 'Fine articolo', value: 'end' },
				],
			},
			initialValue: 'firstParagraph',
		},
	],
})
