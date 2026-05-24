import { defineField, defineType } from 'sanity'
import { VscSymbolColor } from 'react-icons/vsc'
import modules from '../fragments/modules'

export default defineType({
	name: 'article-template',
	title: 'Template articolo',
	type: 'document',
	icon: VscSymbolColor,
	fields: [
		defineField({
			...modules,
			description:
				'Layout di default per tutti gli articoli del blog. Il modulo "Contenuto articolo" è necessario per mostrare il testo. I moduli aggiuntivi (correlati, newsletter, ecc.) vengono mostrati sotto il contenuto.',
		}),
	],
	preview: {
		select: {
			modules: 'modules',
		},
		prepare: ({ modules }) => ({
			title: 'Template articolo',
			subtitle: modules?.length
				? `${modules.length} moduli di default`
				: 'Nessun modulo configurato',
		}),
	},
})
