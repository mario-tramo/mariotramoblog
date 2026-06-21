import { defineCliConfig } from 'sanity/cli'
import { projectId, dataset } from './src/sanity/lib/env'

export default defineCliConfig({
	api: {
		projectId,
		dataset,
	},
})
