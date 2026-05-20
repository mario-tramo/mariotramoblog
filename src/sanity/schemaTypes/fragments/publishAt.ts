import { defineField } from 'sanity'

export default defineField({
	name: 'publishAt',
	title: 'Pubblicazione programmata',
	description:
		'Gestito tramite l\'azione "Programma" nel menu del documento',
	type: 'datetime',
	hidden: true,
})
