import { defineField, defineType } from 'sanity'
import { VscCode } from 'react-icons/vsc'

export default defineType({
	name: 'custom-html',
	title: 'HTML personalizzato',
	icon: VscCode,
	type: 'object',
	groups: [
		{ name: 'html', title: 'HTML', default: true },
		{ name: 'css', title: 'CSS' },
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
			name: 'className',
			title: 'Classe CSS',
			type: 'string',
			description: 'Classe CSS personalizzata da applicare al contenitore',
			group: 'options',
		}),
		defineField({
			name: 'html',
			title: 'HTML',
			type: 'code',
			description: 'Codice HTML personalizzato',
			options: {
				language: 'html',
				languageAlternatives: [{ title: 'HTML', value: 'html' }],
			},
			group: 'html',
		}),
		defineField({
			name: 'css',
			title: 'CSS',
			type: 'code',
			description: 'Stili CSS personalizzati',
			options: {
				language: 'css',
				languageAlternatives: [{ title: 'CSS', value: 'css' }],
			},
			group: 'css',
		}),
	],
	preview: {
		select: {
			html: 'html.code',
			css: 'css.code',
		},
		prepare: ({ html, css }) => ({
			title: html || css,
			subtitle: html || !css ? 'HTML personalizzato' : 'CSS personalizzato',
		}),
	},
})
