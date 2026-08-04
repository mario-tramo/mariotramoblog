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
		revalidateTag: (tag, opts) => calls.tags.push({ tag, opts }),
		revalidatePath: (path, type) => calls.paths.push({ path, type }),
	}
	return { deps, calls }
}

describe('processRevalidation', () => {
	test('empty payload: emergency global flush + layout', () => {
		const { deps, calls } = makeDeps()
		const out = processRevalidation({}, deps)
		assert.deepEqual(out.flushedTags, ['sanity'])
		assert.deepEqual(out.paths, ['/'])
		assert.deepEqual(calls.paths, [{ path: '/', type: 'layout' }])
	})

	test('typed post payload avoids the global flush and layout invalidation', () => {
		const { deps, calls } = makeDeps()
		const out = processRevalidation(
			{ document: { _type: 'blog.post', _id: 'abc', slug: 'mio-post', categorySlug: 'calcio' } },
			deps,
		)
		assert.ok(out.flushedTags.includes('sanity:type:blog.post'))
		assert.ok(out.flushedTags.includes('sanity:posts'))
		assert.ok(!out.flushedTags.includes('sanity'))
		assert.deepEqual(calls.paths, [])
	})

	test('site payload invalidates the layout but not the global tag', () => {
		const { deps, calls } = makeDeps()
		const out = processRevalidation({ document: { _type: 'site', _id: 'site' } }, deps)
		assert.ok(out.flushedTags.includes('site-config'))
		assert.ok(!out.flushedTags.includes('sanity'))
		assert.deepEqual(calls.paths, [{ path: '/', type: 'layout' }])
	})

	test('explicit flushAll enables the emergency global tag', () => {
		const { deps } = makeDeps()
		const out = processRevalidation({ flushAll: true, document: { _type: 'blog.post' } }, deps)
		assert.ok(out.flushedTags.includes('sanity'))
	})

	test('explicit tags and document-derived tags merge and dedupe', () => {
		const { deps } = makeDeps()
		const out = processRevalidation(
			{ tags: ['category:calcio'], document: { _type: 'blog.post', slug: 'mio-post' } },
			deps,
		)
		assert.ok(out.flushedTags.includes('category:calcio'))
		assert.ok(out.flushedTags.includes('sanity:type:blog.post'))
		assert.ok(out.flushedTags.includes('sanity:slug:mio-post'))
	})

	test('valid paths are revalidated and invalid paths are ignored', () => {
		const { deps, calls } = makeDeps()
		processRevalidation(
			{ document: { _type: 'blog.post' }, path: 'nope', paths: ['http://evil.example', '/ok', '/ok'] },
			deps,
		)
		assert.deepEqual(
			calls.paths.filter((entry) => entry.type === undefined).map((entry) => entry.path),
			['/ok'],
		)
	})

	test('all tag revalidations use immediate expiration', () => {
		const { deps, calls } = makeDeps()
		processRevalidation({ document: { _type: 'blog.category', slug: 'calcio' } }, deps)
		assert.ok(calls.tags.every((call) => typeof call.opts === 'object' && call.opts?.expire === 0))
	})

	test('custom paths preserve source order and dedupe', () => {
		const { deps, calls } = makeDeps()
		processRevalidation({ path: '/x', paths: ['/x', '/y', '/x'] }, deps)
		assert.deepEqual(
			calls.paths.filter((entry) => entry.type === undefined).map((entry) => entry.path),
			['/x', '/y'],
		)
	})

	test('payload type remains assignable', () => {
		const payload: RevalidatePayload = { document: { _type: 'page', slug: 'chi-siamo' } }
		assert.equal(payload.document?._type, 'page')
	})
})
