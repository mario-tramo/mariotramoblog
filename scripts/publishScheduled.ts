import { createClient } from '@sanity/client'

const projectId = process.env.SANITY_PROJECT_ID
const dataset = process.env.SANITY_DATASET || 'production'
const token = process.env.SANITY_API_TOKEN
const revalidateUrl = process.env.REVALIDATE_URL
const revalidateSecret = process.env.REVALIDATE_SECRET

if (!projectId || !token) {
	console.error('Missing SANITY_PROJECT_ID or SANITY_API_TOKEN')
	process.exit(1)
}

const client = createClient({
	projectId,
	dataset,
	token,
	apiVersion: '2024-12-01',
	useCdn: false,
})

interface ScheduledDraft {
	_id: string
	_type: string
	publishAt: string
	[key: string]: unknown
}

async function publishScheduledDocuments() {
	const query = `*[
		_id in path("drafts.**") &&
		defined(publishAt) &&
		publishAt <= now()
	]`

	const drafts: ScheduledDraft[] = await client.fetch(query)

	console.log(`Found ${drafts.length} document(s) to publish`)

	if (drafts.length === 0) return

	let published = 0
	let errors = 0

	for (const draft of drafts) {
		const publishedId = draft._id.replace('drafts.', '')

		try {
			// Create or replace the published version (without publishAt)
			const { publishAt: _, _id, ...docWithoutSchedule } = draft
			await client.createOrReplace({
				...docWithoutSchedule,
				_id: publishedId,
			})

			// Delete the draft
			await client.delete(draft._id)

			published++
			console.log(`Published: ${publishedId} (type: ${draft._type})`)
		} catch (err) {
			errors++
			console.error(`Failed to publish ${publishedId}:`, err)
		}
	}

	console.log(`Done: ${published} published, ${errors} error(s)`)

	// Trigger revalidation
	if (published > 0 && revalidateUrl && revalidateSecret) {
		try {
			const res = await fetch(revalidateUrl, {
				method: 'POST',
				headers: { 'x-revalidate-secret': revalidateSecret },
			})

			if (res.ok) {
				console.log('Frontend revalidation triggered')
			} else {
				console.error(`Revalidation failed: ${res.status}`)
			}
		} catch (err) {
			console.error('Revalidation error:', err)
		}
	}
}

publishScheduledDocuments()
