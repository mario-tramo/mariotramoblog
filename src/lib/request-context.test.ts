import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { getRequestSearchParams, runWithSearchParams } from './request-context'

describe('request context', () => {
	test('returns an empty object outside a request context', () => {
		assert.deepEqual(getRequestSearchParams(), {})
	})

	test('propagates query params through async work', async () => {
		const result = await runWithSearchParams({ categoria: 'calcio', page: '2' }, async () => {
			await Promise.resolve()
			return getRequestSearchParams()
		})
		assert.deepEqual(result, { categoria: 'calcio', page: '2' })
	})

	test('does not leak one request context into another', async () => {
		const first = runWithSearchParams({ categoria: 'calcio' }, () => getRequestSearchParams())
		const second = runWithSearchParams({ categoria: 'tennis' }, () => getRequestSearchParams())
		assert.deepEqual(first, { categoria: 'calcio' })
		assert.deepEqual(second, { categoria: 'tennis' })
		assert.deepEqual(getRequestSearchParams(), {})
	})
})
