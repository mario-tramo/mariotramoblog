import { defineArrayMember, defineField, defineType } from 'sanity'
import { TfiStatsUp } from 'react-icons/tfi'
import { getBlockText, count } from '@/lib/utils'

export default defineType({
	name: 'trust-bar',
	title: 'Barra di fiducia (statistiche)',
	icon: TfiStatsUp,
	type: 'object',
	description:
		'Striscia di numeri e indicatori di autorevolezza (es. anni di attività, articoli pubblicati, categorie seguite). Rafforza la fiducia e i segnali EEAT.',
	groups: [
		{ name: 'content', title: 'Contenuto', default: true },
		{ name: 'options', title: 'Opzioni' },
	],
	fields: [
		defineField({
			name: 'options',
			title: 'Opzioni modulo',
			type: 'module-options',
			description: 'Impostazioni generali del modulo (visibilita, ancoraggio)',
			group: 'options',
		}),
		defineField({
			name: 'pretitle',
			title: 'Sopratitolo',
			type: 'string',
			description: 'Testo breve mostrato sopra le statistiche',
			group: 'content',
		}),
		defineField({
			name: 'intro',
			title: 'Introduzione',
			type: 'array',
			description: 'Testo introduttivo mostrato sopra le statistiche',
			of: [{ type: 'block' }],
			group: 'content',
		}),
		defineField({
			name: 'stats',
			title: 'Statistiche',
			type: 'array',
			description:
				'Lista di numeri/indicatori (es. "10+ anni", "5.000 articoli", "12 categorie")',
			of: [
				defineArrayMember({
					type: 'object',
					name: 'stat',
					icon: TfiStatsUp,
					fields: [
						defineField({
							name: 'value',
							title: 'Valore',
							type: 'string',
							description:
								'Il numero o dato in evidenza (es. "10+", "5.000", "12"). Tienilo breve.',
							validation: (Rule) =>
								Rule.required().error('Il valore è obbligatorio'),
						}),
						defineField({
							name: 'label',
							title: 'Etichetta',
							type: 'string',
							description:
								'Descrizione sotto il valore (es. "anni di attività", "articoli pubblicati")',
							validation: (Rule) =>
								Rule.required().error('L\'etichetta è obbligatoria'),
						}),
					],
					preview: {
						select: { value: 'value', label: 'label' },
						prepare: ({ value, label }) => ({
							title: value,
							subtitle: label,
						}),
					},
				}),
			],
			validation: (Rule) =>
				Rule.required().min(2).max(6).error('Aggiungi da 2 a 6 statistiche'),
			group: 'content',
		}),
	],
	preview: {
		select: { pretitle: 'pretitle', intro: 'intro', stats: 'stats' },
		prepare: ({ pretitle, intro, stats }) => ({
			title: pretitle || getBlockText(intro) || count(stats, 'statistica'),
			subtitle: 'Barra di fiducia',
		}),
	},
})
