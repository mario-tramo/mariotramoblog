import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { safeEqual, genToken, sha256 } from './crypto'

describe('safeEqual', () => {
	test('returns true for identical strings', () => {
		assert.equal(safeEqual('hello', 'hello'), true)
	})

	test('returns false for different strings of same length', () => {
		assert.equal(safeEqual('hello', 'hElio'), false)
	})

	test('returns false for strings of different length', () => {
		assert.equal(safeEqual('abc', 'abcd'), false)
	})

	test('returns false for null/undefined first arg', () => {
		assert.equal(safeEqual(null as unknown as string, 'x'), false)
	})

	test('returns false for null/undefined second arg', () => {
		assert.equal(safeEqual('x', null as unknown as string), false)
	})

	test('returns false for empty inputs', () => {
		assert.equal(safeEqual('', ''), false)
	})
})

describe('genToken', () => {
	test('default length is 64 hex chars (32 bytes)', () => {
		assert.equal(genToken().length, 64)
	})

	test('honours custom byte length', () => {
		assert.equal(genToken(16).length, 32)
	})

	test('two consecutive calls produce different values', () => {
		assert.notEqual(genToken(), genToken())
	})
})

describe('sha256', () => {
	test('produces 64-char hex', () => {
		assert.equal(sha256('test').length, 64)
	})

	test('is deterministic', () => {
		assert.equal(sha256('test'), sha256('test'))
	})

	test('different inputs produce different hashes', () => {
		assert.notEqual(sha256('a'), sha256('b'))
	})

	test('matches Node crypto reference', () => {
		const { createHash } = require('node:crypto')
		const expected = createHash('sha256').update('hello').digest('hex')
		assert.equal(sha256('hello'), expected)
	})
})
