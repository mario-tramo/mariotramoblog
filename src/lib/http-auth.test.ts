import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { NextRequest } from 'next/server'
import { isAuthorized } from './http-auth'

function makeRequest(
	opts: { url?: string; headers?: Record<string, string> } = {},
): NextRequest {
	const url = opts.url ?? 'http://localhost/'
	const headers = new Headers(opts.headers ?? {})
	return new NextRequest(new Request(url, { headers }))
}

const SECRET = 'super-secret-test-key-1234567890'

describe('isAuthorized', () => {
	test('returns false when expected secret is empty/null/undefined', () => {
		const r = makeRequest({ headers: { authorization: `Bearer ${SECRET}` } })
		assert.equal(isAuthorized(r, ''), false)
		assert.equal(isAuthorized(r, null), false)
		assert.equal(isAuthorized(r, undefined), false)
	})

	test('matches via Authorization: Bearer', () => {
		const r = makeRequest({ headers: { authorization: `Bearer ${SECRET}` } })
		assert.equal(isAuthorized(r, SECRET), true)
	})

	test('matches via custom header from options', () => {
		const r = makeRequest({ headers: { 'x-cron-secret': SECRET } })
		assert.equal(
			isAuthorized(r, SECRET, { headers: ['x-cron-secret'] }),
			true,
		)
	})

	test('matches via ?secret= query param', () => {
		const r = makeRequest({ url: `http://localhost/api?secret=${SECRET}` })
		assert.equal(isAuthorized(r, SECRET), true)
	})

	test('rejects wrong secret', () => {
		const r = makeRequest({ headers: { authorization: 'Bearer wrong-token' } })
		assert.equal(isAuthorized(r, SECRET), false)
	})

	test('rejects when no candidate present', () => {
		assert.equal(isAuthorized(makeRequest(), SECRET), false)
	})

	test('multiple header names — any match wins', () => {
		const r = makeRequest({ headers: { 'x-cron-secret': SECRET } })
		assert.equal(
			isAuthorized(r, SECRET, {
				headers: ['x-cron-secret', 'x-other-secret'],
			}),
			true,
		)
	})

	test('case-insensitive Bearer parsing', () => {
		const r = makeRequest({ headers: { authorization: `bearer ${SECRET}` } })
		assert.equal(isAuthorized(r, SECRET), true)
	})

	test('different-length candidate does not match (no early-true)', () => {
		const r = makeRequest({ headers: { authorization: `Bearer ${SECRET}extra` } })
		assert.equal(isAuthorized(r, SECRET), false)
	})
})
