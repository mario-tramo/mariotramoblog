import { createClient } from '@sanity/client'
import { projectId, dataset, apiVersion } from '@/sanity/lib/env'
import { dev } from '@/lib/env'

export const client = createClient({
	projectId,
	dataset,
	apiVersion,
	useCdn: !dev,
	stega: {
		studioUrl: '/admin',
	},
})
