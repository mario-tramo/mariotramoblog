import { defineType, defineField } from 'sanity'
import { RxDividerHorizontal } from 'react-icons/rx'

export default defineType({
	name: 'divider',
	title: 'Divider',
	icon: RxDividerHorizontal,
	type: 'object',
	fields: [
		defineField({
			name: 'style',
			title: 'Stile',
			type: 'string',
			options: {
				list: [
					{ title: 'Linea', value: 'line' },
					{ title: 'Spazio', value: 'space' },
				],
			},
			initialValue: 'line',
		}),
	],
	preview: {
		prepare: () => ({
			title: 'Divider',
			subtitle: 'Spaziatore',
		}),
	},
})
