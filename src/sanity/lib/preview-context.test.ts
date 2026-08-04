import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { isPreviewRender, runInPreview } from './preview-context'

describe('preview context', () => {
	test('is disabled outside preview rendering', () => {
		assert.equal(isPreviewRender(), false)
	})

	test('is enabled only inside the preview callback and async descendants', async () => {
		const result = await runInPreview(async () => {
			assert.equal(isPreviewRender(), true)
			await Promise.resolve()
			return isPreviewRender()
		})
		assert.equal(result, true)
		assert.equal(isPreviewRender(), false)
	})
})
