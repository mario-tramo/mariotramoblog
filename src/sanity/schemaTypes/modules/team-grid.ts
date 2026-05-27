import { defineType } from 'sanity'
import { HiOutlineUserGroup } from 'react-icons/hi2'

export default defineType({
	name: 'team-grid',
	title: 'Griglia Team',
	icon: HiOutlineUserGroup,
	type: 'object',
	fields: [
		{
			name: 'title',
			title: 'Titolo sezione',
			type: 'string',
			initialValue: 'La Redazione',
		},
	],
	preview: {
		prepare: () => ({
			title: 'Griglia Team (autori)',
		}),
	},
})
