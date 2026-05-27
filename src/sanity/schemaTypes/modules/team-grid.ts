import { defineType } from 'sanity'
import { HiOutlineUserGroup } from 'react-icons/hi2'

export default defineType({
	name: 'team-grid',
	title: 'Griglia Team',
	icon: HiOutlineUserGroup,
	type: 'object',
	fields: [],
	preview: {
		prepare: () => ({
			title: 'Griglia Team (autori)',
		}),
	},
})
