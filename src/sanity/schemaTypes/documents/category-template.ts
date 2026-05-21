import { defineField, defineType } from 'sanity'
import { VscSymbolColor } from 'react-icons/vsc'
import modules from '../fragments/modules'

export default defineType({
	name: 'category-template',
	title: 'Template categoria',
	type: 'document',
	icon: VscSymbolColor,
	fields: [
		defineField({
			...modules,
			description:
				'Layout di default per tutte le pagine categoria. I moduli blog (Lista articoli, Carosello, ecc.) filtreranno automaticamente per la categoria corrente. Ogni categoria puo sovrascrivere questo template aggiungendo i propri moduli.',
		}),
	],
	preview: {
		select: {
			modules: 'modules',
		},
		prepare: ({ modules }) => ({
			title: 'Template categoria',
			subtitle: modules?.length
				? `${modules.length} moduli di default`
				: 'Nessun modulo configurato',
		}),
	},
})
