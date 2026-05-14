import { defineType } from 'sanity'
import { RxDividerHorizontal } from 'react-icons/rx'

export default defineType({
	name: 'divider',
	title: 'Divider',
	icon: RxDividerHorizontal,
	type: 'object',
	fields: [],
	preview: {
		prepare: () => ({
			title: 'Divider',
			subtitle: 'Spaziatore',
		}),
	},
})
