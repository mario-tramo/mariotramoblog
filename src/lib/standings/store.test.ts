import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { validateStandingsPayload } from './store'

function row(position: number) {
	return {
		position,
		team: `Team ${position}`,
		playedGames: 1,
		won: 1,
		draw: 0,
		lost: 0,
		goalsFor: 2,
		goalsAgainst: 0,
		goalDifference: 2,
		points: 3,
	}
}

function payload(table = Array.from({ length: 20 }, (_, index) => row(index + 1))) {
	return {
		season: '2026',
		standings: {
			SA: {
				competition: { code: 'SA', name: 'Serie A' },
				season: '2026',
				table,
			},
		},
	}
}

describe('validateStandingsPayload', () => {
	test('accepts a complete internally consistent table', () => {
		assert.equal(validateStandingsPayload(payload()), true)
	})

	test('rejects an incomplete table', () => {
		assert.equal(validateStandingsPayload(payload().standings.SA.table.slice(0, 19)), false)
	})

	test('accepts a negative goal difference', () => {
		const valid = payload()
		valid.standings.SA.table[19]!.goalsFor = 0
		valid.standings.SA.table[19]!.goalsAgainst = 3
		valid.standings.SA.table[19]!.goalDifference = -3
		assert.equal(validateStandingsPayload(valid), true)
	})

	test('rejects mismatched seasons and unbalanced match totals', () => {
		const invalid = payload()
		invalid.standings.SA.season = '2025'
		assert.equal(validateStandingsPayload(invalid), false)

		const unbalanced = payload()
		unbalanced.standings.SA.table[0]!.won = 0
		assert.equal(validateStandingsPayload(unbalanced), false)
	})
})
