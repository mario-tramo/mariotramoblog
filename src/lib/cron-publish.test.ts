import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { publishScheduledDrafts, SCHEDULED_DRAFTS_QUERY } from './cron-publish'

interface MockCalls {
	fetchedQueries: string[]
	createdOrReplaced: Array<Record<string, unknown>>
	deleted: string[]
}

function mockClient(drafts: unknown[]): {
	client: any
	calls: MockCalls
} {
	const calls: MockCalls = {
		fetchedQueries: [],
		createdOrReplaced: [],
		deleted: [],
	}
	return {
		calls,
		client: {
			fetch: async (q: string) => {
				calls.fetchedQueries.push(q)
				return drafts
			},
			createOrReplace: async (doc: Record<string, unknown>) => {
				calls.createdOrReplaced.push(doc)
			},
			delete: async (id: string) => {
				calls.deleted.push(id)
			},
		},
	}
}

describe('SCHEDULED_DRAFTS_QUERY', () => {
	test('restricts to drafts.* with publishAt defined and <= now()', () => {
		assert.ok(SCHEDULED_DRAFTS_QUERY.includes('drafts.**'))
		assert.ok(SCHEDULED_DRAFTS_QUERY.includes('defined(publishAt)'))
		assert.ok(SCHEDULED_DRAFTS_QUERY.includes('publishAt <= now()'))
	})
})

describe('publishScheduledDrafts', () => {
	test('returns zeros when there are no drafts (and only one fetch call)', async () => {
		const { client, calls } = mockClient([])
		const result = await publishScheduledDrafts({ client })
		assert.deepEqual(result, { found: 0, published: 0, errors: 0 })
		assert.equal(calls.fetchedQueries.length, 1)
		assert.equal(calls.fetchedQueries[0], SCHEDULED_DRAFTS_QUERY)
		assert.equal(calls.createdOrReplaced.length, 0)
		assert.equal(calls.deleted.length, 0)
	})

	test('promotes a single draft: strips publishAt/_id before createOrReplace, deletes draft', async () => {
		const drafts = [
			{
				_id: 'drafts.my-post',
				_type: 'blog.post',
				publishAt: '2026-01-01T00:00:00.000Z',
				title: 'Hello',
				body: ['paragraph'],
			},
		]
		const { client, calls } = mockClient(drafts)
		const result = await publishScheduledDrafts({ client })

		assert.deepEqual(result, { found: 1, published: 1, errors: 0 })

		assert.equal(calls.createdOrReplaced.length, 1)
		const created = calls.createdOrReplaced[0]!
		assert.equal(created._id, 'my-post')
		assert.equal(created.title, 'Hello')
		assert.equal((created as any)._type, 'blog.post')
		assert.ok(!('publishAt' in created))
		assert.ok(!('_id' in (created as any)) || (created as any)._id === 'my-post')

		assert.deepEqual(calls.deleted, ['drafts.my-post'])
	})

	test('multiple drafts: each gets its own createOrReplace + delete, in order', async () => {
		const drafts = [
			{ _id: 'drafts.a', _type: 'page', publishAt: '2026-01-01', title: 'A' },
			{ _id: 'drafts.b', _type: 'page', publishAt: '2026-01-02', title: 'B' },
			{ _id: 'drafts.c', _type: 'page', publishAt: '2026-01-03', title: 'C' },
		]
		const { client, calls } = mockClient(drafts)
		const result = await publishScheduledDrafts({ client })

		assert.deepEqual(result, { found: 3, published: 3, errors: 0 })
		assert.deepEqual(
			calls.createdOrReplaced.map((d) => d._id),
			['a', 'b', 'c'],
		)
		assert.deepEqual(calls.deleted, ['drafts.a', 'drafts.b', 'drafts.c'])
	})

	test('one draft fails mid-batch: others still publish, errors counter increments', async () => {
		const drafts = [
			{ _id: 'drafts.a', _type: 'page', publishAt: '2026-01-01', title: 'A' },
			{ _id: 'drafts.bad', _type: 'page', publishAt: '2026-01-01', title: 'B' },
			{ _id: 'drafts.c', _type: 'page', publishAt: '2026-01-01', title: 'C' },
		]
		const { client, calls } = mockClient(drafts)

		let count = 0
		client.createOrReplace = async (doc: Record<string, unknown>) => {
			count++
			if (count === 2) throw new Error('simulated Sanity rate limit')
			calls.createdOrReplaced.push(doc)
		}
		client.delete = async (id: string) => {
			calls.deleted.push(id)
		}

		const result = await publishScheduledDrafts({ client })

		assert.equal(result.found, 3)
		assert.equal(result.published, 2)
		assert.equal(result.errors, 1)

		// Two successful creates (skipping the broken one) and one
		// corresponding delete (only after successful create).
		assert.deepEqual(
			calls.createdOrReplaced.map((d) => d._id),
			['a', 'c'],
		)
		assert.deepEqual(calls.deleted, ['drafts.a', 'drafts.c'])
	})

	test('handles null/undefined return from client.fetch', async () => {
		const { client, calls } = mockClient([])
		client.fetch = async (q: string) => {
			calls.fetchedQueries.push(q)
			return null as any
		}
		const result = await publishScheduledDrafts({ client })
		assert.deepEqual(result, { found: 0, published: 0, errors: 0 })
	})
})
