import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { isAuthorized } from './http-auth'

function makeRequest(overrides: Partial<{
	authorization: string
	customHeader: string
	query: Record<string, string>
}> = {}) {
	const headers = new Map<string, string>()
	if (overrides.authorization) headers.set('authorization', overrides.authorization)
	if (overrides.customHeader) headers.set('x-secret', overrides.customHeader)

	return {
		headers,
		nextUrl: overrides.query
			? { searchParams: new URLSearchParams(overrides.query) }
			: { searchParams: new URLSearchParams() },
	} as any
}

const SECRET = 'super-secret-key-123'

describe('isAuthorized', () => {
	test('returns false when expected secret is empty/null/undefined', () => {
		assert.equal(isAuthorized(makeRequest({ authorization: 'Bearer x' }), ''), false)
		assert.equal(isAuthorized(makeRequest({ authorization: 'Bearer x' }), null), false)
		assert.equal(isAuthorized(makeRequest({ authorization: 'Bearer x' }), undefined), false)
	})

	test('matches via Authorization: Bearer', () => {
		const req = makeRequest({ authorization: `Bearer ${SECRET}` })
		assert.equal(isAuthorized(req, SECRET), true)
	})

	test('matches via custom header from options', () => {
		const req = makeRequest({ customHeader: SECRET })
		assert.equal(isAuthorized(req, SECRET, { headerNames: ['x-secret'] }), true)
	})

	test('matches via ?secret= query param', () => {
		const req = makeRequest({ query: { secret: SECRET } })
		assert.equal(isAuthorized(req, SECRET, { queryParam: 'secret' }), true)
	})

	test('rejects wrong secret', () => {
		const req = makeRequest({ authorization: 'Bearer wrong-secret' })
		assert.equal(isAuthorized(req, SECRET), false)
	})

	test('rejects when no candidate present', () => {
		assert.equal(isAuthorized(makeRequest(), SECRET), false)
	})

	test('multiple header names — any match wins', () => {
		const req = makeRequest({ customHeader: SECRET })
		assert.equal(isAuthorized(req, SECRET, { headerNames: ['authorization', 'x-secret'] }), true)
	})

	test('case-insensitive Bearer parsing', () => {
		assert.equal(isAuthorized(makeRequest({ authorization: `bearer ${SECRET}` }), SECRET), true)
		assert.equal(isAuthorized(makeRequest({ authorization: `BEARER ${SECRET}` }), SECRET), true)
	})

	test('different-length candidate does not match (no early-true)', () => {
		assert.equal(isAuthorized(makeRequest({ authorization: `Bearer ${SECRET}extra` }), SECRET), false)
	})
})
