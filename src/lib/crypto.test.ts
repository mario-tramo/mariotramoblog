import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { safeEqual, genToken, sha256 } from './crypto'

describe('safeEqual', () => {
	test('returns true for identical strings', () => {
		assert.equal(safeEqual('abc', 'abc'), true)
	})

	test('returns false for different strings of same length', () => {
		assert.equal(safeEqual('abc', 'abd'), false)
	})

	test('returns false for strings of different length', () => {
		assert.equal(safeEqual('abc', 'abcd'), false)
	})

	test('returns false for null/undefined first arg', () => {
		assert.equal(safeEqual(null, 'abc'), false)
		assert.equal(safeEqual(undefined, 'abc'), false)
	})

	test('returns false for null/undefined second arg', () => {
		assert.equal(safeEqual('abc', null), false)
		assert.equal(safeEqual('abc', undefined), false)
	})

	test('returns false for empty inputs', () => {
		assert.equal(safeEqual('', ''), false)
		assert.equal(safeEqual('a', ''), false)
	})
})

describe('genToken', () => {
	test('default length is 64 hex chars (32 bytes)', () => {
		const t = genToken()
		assert.equal(t.length, 64)
		assert.match(t, /^[0-9a-f]+$/)
	})

	test('honours custom byte length', () => {
		const t = genToken(8)
		assert.equal(t.length, 16)
	})

	test('two consecutive calls produce different values', () => {
		assert.notEqual(genToken(), genToken())
	})
})

describe('sha256', () => {
	test('produces 64-char hex', () => {
		const h = sha256('hello')
		assert.equal(h.length, 64)
		assert.match(h, /^[0-9a-f]+$/)
	})

	test('is deterministic', () => {
		assert.equal(sha256('hello'), sha256('hello'))
	})

	test('different inputs produce different hashes', () => {
		assert.notEqual(sha256('a'), sha256('b'))
	})

	test('matches Node crypto reference', () => {
		const reference = createHash('sha256').update('hello').digest('hex')
		assert.equal(sha256('hello'), reference)
	})
})
