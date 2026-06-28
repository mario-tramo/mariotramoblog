import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { buildTags, tagsForDocument } from './cache'

describe('buildTags', () => {
	test('always includes sanity base tag', () => {
		assert.deepEqual([...buildTags(undefined, undefined)], ['sanity'])
	})

	test('adds type/id/slug when hint provided', () => {
		const tags = buildTags(
			{ type: 'blog.post', id: 'abc', slug: 'mio-post' },
			undefined,
		)
		assert.ok(tags.includes('sanity'))
		assert.ok(tags.includes('sanity:type:blog.post'))
		assert.ok(tags.includes('sanity:doc:abc'))
		assert.ok(tags.includes('sanity:slug:mio-post'))
	})

	test('partial hint — only what is provided appears', () => {
		const tags = buildTags({ type: 'page' }, undefined)
		assert.ok(tags.includes('sanity:type:page'))
		assert.ok(!tags.some((t) => t.startsWith('sanity:doc:')))
		assert.ok(!tags.some((t) => t.startsWith('sanity:slug:')))
	})

	test('extra tags merged in', () => {
		const tags = buildTags(undefined, ['category:calcio', 'site-config'])
		assert.ok(tags.includes('category:calcio'))
		assert.ok(tags.includes('site-config'))
	})

	test('deduplicates extra tags', () => {
		const tags = buildTags({ type: 'blog.post' }, [
			'sanity:type:blog.post',
			'extra',
			'sanity:type:blog.post',
		])
		const occurrences = tags.filter((t) => t === 'sanity:type:blog.post').length
		assert.equal(occurrences, 1)
	})

	test('null hint fields are skipped', () => {
		const tags = buildTags(
			{ type: null, id: null, slug: null },
			undefined,
		)
		assert.deepEqual([...tags].sort(), ['sanity'])
	})

	test('empty-string hint fields treated as falsy (skipped)', () => {
		const tags = buildTags(
			{ type: '', id: '', slug: '' },
			undefined,
		)
		assert.deepEqual([...tags].sort(), ['sanity'])
	})

	test('empty-string entries in extras are skipped', () => {
		const tags = buildTags(undefined, ['valid', '', '   '])
		assert.deepEqual([...tags].sort(), ['sanity', 'valid'])
	})
})

describe('tagsForDocument', () => {
	test('returns granular tags but NOT the global sanity tag', () => {
		const tags = tagsForDocument({
			_type: 'blog.post',
			_id: 'abc',
			slug: 'mio-post',
		})
		assert.ok(!tags.includes('sanity'))
		assert.ok(tags.includes('sanity:type:blog.post'))
		assert.ok(tags.includes('sanity:doc:abc'))
		assert.ok(tags.includes('sanity:slug:mio-post'))
	})

	test('empty document → empty tags', () => {
		assert.deepEqual(tagsForDocument({}), [])
	})

	test('null fields are skipped', () => {
		assert.deepEqual(
			tagsForDocument({ _type: null, _id: null, slug: null }),
			[],
		)
	})
})
