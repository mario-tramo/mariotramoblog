import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { buildTags, tagsForDocument, SANITY_GLOBAL_TAG } from './cache'

describe('buildTags', () => {
	test('uses a scoped fallback tag when no hint is available', () => {
		assert.deepEqual(buildTags(undefined, undefined), ['sanity:content'])
	})

	test('adds type/id/slug when hint provided', () => {
		const tags = buildTags({ type: 'blog.post', id: 'abc', slug: 'mio-post' }, undefined)
		assert.ok(tags.includes('sanity:type:blog.post'))
		assert.ok(tags.includes('sanity:doc:abc'))
		assert.ok(tags.includes('sanity:slug:mio-post'))
		assert.ok(!tags.includes(SANITY_GLOBAL_TAG))
	})

	test('partial hint — only what is provided appears', () => {
		assert.deepEqual(buildTags({ type: 'page' }, undefined), ['sanity:type:page'])
	})

	test('extra tags merged in', () => {
		assert.deepEqual(buildTags(undefined, ['category:calcio', 'site-config']), ['category:calcio', 'site-config'])
	})

	test('deduplicates extra tags', () => {
		assert.deepEqual(
			buildTags({ type: 'blog.post' }, ['sanity:type:blog.post', 'extra', 'sanity:type:blog.post']),
			['sanity:type:blog.post', 'extra'],
		)
	})

	test('null and empty hint fields fall back to scoped content tag', () => {
		assert.deepEqual(buildTags({ type: null, id: null, slug: null }, undefined), ['sanity:content'])
		assert.deepEqual(buildTags({ type: '', id: '', slug: '' }, undefined), ['sanity:content'])
	})

	test('empty-string entries in extras are skipped', () => {
		assert.deepEqual(buildTags(undefined, ['valid', '', '   ']), ['valid'])
	})
})

describe('tagsForDocument', () => {
	test('returns granular tags and collection dependencies', () => {
		const tags = tagsForDocument({
			_type: 'blog.post',
			_id: 'abc',
			slug: 'mio-post',
			categorySlug: 'calcio',
		})
		assert.ok(!tags.includes(SANITY_GLOBAL_TAG))
		assert.ok(tags.includes('sanity:type:blog.post'))
		assert.ok(tags.includes('sanity:doc:abc'))
		assert.ok(tags.includes('sanity:slug:mio-post'))
		assert.ok(tags.includes('sanity:posts'))
		assert.ok(tags.includes('sanity:category:calcio'))
		assert.ok(tags.includes('sanity:rss'))
	})

	test('empty document → scoped fallback tag', () => {
		assert.deepEqual(tagsForDocument({}), ['sanity:content'])
	})

	test('null fields → scoped fallback tag', () => {
		assert.deepEqual(tagsForDocument({ _type: null, _id: null, slug: null }), ['sanity:content'])
	})
})
