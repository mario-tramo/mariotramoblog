import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import {
	processRevalidation,
	type RevalidateDeps,
	type RevalidatePayload,
} from './revalidate-handler'

function makeDeps() {
	const calls = {
		tags: [] as Array<{
			tag: string
			opts: string | { [key: string]: number | undefined } | undefined
		}>,
		paths: [] as Array<{ path: string; type?: string }>,
	}
	const deps: RevalidateDeps = {
		revalidateTag: (tag, opts) => {
			calls.tags.push({ tag, opts })
		},
		revalidatePath: (path, type) => {
			calls.paths.push({ path, type })
		},
	}
	return { deps, calls }
}

describe('processRevalidation', () => {
	test('empty payload: only flushes sanity + layout', () => {
		const { deps, calls } = makeDeps()
		const out = processRevalidation({}, deps)

		assert.deepEqual(out.flushedTags, ['sanity'])
		assert.deepEqual(out.paths, ['/'])
		assert.equal(calls.tags.length, 1)
		assert.equal(calls.tags[0]?.tag, 'sanity')
		assert.deepEqual(calls.tags[0]?.opts, { expire: 0 })
		assert.deepEqual(calls.paths, [{ path: '/', type: 'layout' }])
	})

	test('tags[] adds to flush list, dedupes sanity', () => {
		const { deps } = makeDeps()
		const out = processRevalidation(
			{ tags: ['sanity', 'sanity:type:blog.post', 'sanity:slug:mio'] },
			deps,
		)
		const sanityCount = out.flushedTags.filter((t) => t === 'sanity').length
		assert.equal(sanityCount, 1)
		assert.ok(out.flushedTags.includes('sanity:type:blog.post'))
		assert.ok(out.flushedTags.includes('sanity:slug:mio'))
	})

	test('document payload derives granular tags server-side', () => {
		const { deps } = makeDeps()
		const out = processRevalidation(
			{
				document: {
					_type: 'blog.post',
					_id: 'abc',
					slug: 'mio-post',
				},
			},
			deps,
		)
		assert.ok(out.flushedTags.includes('sanity:type:blog.post'))
		assert.ok(out.flushedTags.includes('sanity:doc:abc'))
		assert.ok(out.flushedTags.includes('sanity:slug:mio-post'))
	})

	test('merges explicit tags[] with document-derived tags', () => {
		const { deps } = makeDeps()
		const out = processRevalidation(
			{
				tags: ['category:calcio'],
				document: { _type: 'blog.post', slug: 'mio-post' },
			},
			deps,
		)
		assert.ok(out.flushedTags.includes('category:calcio'))
		assert.ok(out.flushedTags.includes('sanity:type:blog.post'))
		assert.ok(out.flushedTags.includes('sanity:slug:mio-post'))
	})

	test('valid paths starting with / get revalidated', () => {
		const { deps, calls } = makeDeps()
		processRevalidation(
			{ path: '/blog/post', paths: ['/legal', '/foo'] },
			deps,
		)
		const simplePaths = calls.paths
			.filter((p) => p.type === undefined)
			.map((p) => p.path)
		assert.deepEqual(simplePaths, ['/blog/post', '/legal', '/foo'])
	})

	test('invalid paths (no leading /, or traversal) are filtered out', () => {
		const { deps, calls } = makeDeps()
		processRevalidation(
			{
				path: 'nope',
				paths: ['http://evil.example', '/ok', '../../../etc/passwd'],
			},
			deps,
		)
		const simplePaths = calls.paths
			.filter((p) => p.type === undefined)
			.map((p) => p.path)
		assert.deepEqual(simplePaths, ['/ok'])
	})

	test('duplicate paths dedupe', () => {
		const { deps, calls } = makeDeps()
		processRevalidation(
			{ path: '/x', paths: ['/x', '/y', '/x'] },
			deps,
		)
		const simplePaths = calls.paths
			.filter((p) => p.type === undefined)
			.map((p) => p.path)
		assert.deepEqual(simplePaths, ['/x', '/y'])
	})

	test('full payload: global + document + custom tags + paths all flow through', () => {
		const { deps, calls } = makeDeps()
		const out = processRevalidation(
			{
				path: '/calcio/mio-post',
				tags: ['category:calcio'],
				document: {
					_type: 'blog.post',
					_id: 'x',
					slug: 'mio-post',
				},
			} satisfies RevalidatePayload,
			deps,
		)

		assert.ok(out.flushedTags.includes('sanity'))
		assert.ok(out.flushedTags.includes('sanity:type:blog.post'))
		assert.ok(out.flushedTags.includes('sanity:doc:x'))
		assert.ok(out.flushedTags.includes('sanity:slug:mio-post'))
		assert.ok(out.flushedTags.includes('category:calcio'))

		assert.ok(out.paths.includes('/'))
		assert.ok(out.paths.includes('/calcio/mio-post'))

		// All revalidateTag calls include `{ expire: 0 }`.
		assert.ok(
			calls.tags.every((c) => {
				const o = c.opts
				return typeof o === 'object' && o !== null && o.expire === 0
			}),
			'every tag revalidation must use expire=0',
		)
	})

	test('non-string entries in tags[] are ignored', () => {
		const { deps } = makeDeps()
		const out = processRevalidation(
			{ tags: ['good', 42, null, undefined, '', 'also-good'] as any },
			deps,
		)
		assert.ok(out.flushedTags.includes('good'))
		assert.ok(out.flushedTags.includes('also-good'))
		assert.ok(!out.flushedTags.includes(42 as any))
	})
})
