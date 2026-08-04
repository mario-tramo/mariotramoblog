import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { NextRequest } from 'next/server'
import { proxy } from './proxy'

function request(path: string, cookies?: Record<string, string>) {
	const headers = new Headers()
	if (cookies) {
		headers.set(
			'cookie',
			Object.entries(cookies)
				.map(([name, value]) => `${name}=${value}`)
				.join('; '),
		)
	}
	return new NextRequest(`https://www.trmsport.com${path}`, { headers })
}

describe('proxy', () => {
	test('leaves normal public requests untouched', () => {
		const response = proxy(request('/calcio'))
		assert.equal(response.headers.get('x-middleware-rewrite'), null)
		assert.equal(response.headers.get('x-pathname'), '/calcio')
	})

	test('rewrites Draft Mode requests to the internal preview route', () => {
		const response = proxy(request('/calcio/articolo', { __prerender_bypass: 'preview' }))
		assert.equal(
			response.headers.get('x-middleware-rewrite'),
			'https://www.trmsport.com/preview-internal/calcio/articolo',
		)
	})

	test('rewrites the homepage to the preview index route', () => {
		const response = proxy(request('/', { __prerender_bypass: 'preview' }))
		assert.equal(
			response.headers.get('x-middleware-rewrite'),
			'https://www.trmsport.com/preview-internal',
		)
	})

	test('rewrites query-filtered requests without losing the query string', () => {
		const response = proxy(request('/calcio?categoria=tennis&page=2'))
		assert.equal(
			response.headers.get('x-middleware-rewrite'),
			'https://www.trmsport.com/filters-internal/calcio?categoria=tennis&page=2',
		)
	})

	test('does not rewrite direct internal filter routes without the marker', () => {
		const response = proxy(request('/filters-internal/calcio?categoria=tennis'))
		assert.equal(response.headers.get('x-middleware-rewrite'), null)
	})

	test('does not recursively rewrite an internal preview request', () => {
		const response = proxy(request('/preview-internal/calcio', { __prerender_bypass: 'preview' }))
		assert.equal(response.headers.get('x-middleware-rewrite'), null)
	})
})
