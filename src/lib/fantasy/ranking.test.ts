import test from 'node:test'
import assert from 'node:assert/strict'
import { computeFantasyIndex, type PlayerMatchInput } from './ranking'

const base: PlayerMatchInput = {
	playerId: 'p1',
	playerName: 'Test',
	team: 'Test FC',
	position: 'MID',
	minutes: 90,
	goals: 1,
	assists: 0,
	xG: 0.4,
	xA: 0.1,
	keyPasses: 2,
	progressivePasses: 5,
	tacklesWon: 1,
	recoveries: 3,
	cleanSheet: false,
}

test('zero minutes => zero score', () => {
	assert.equal(computeFantasyIndex({ ...base, minutes: 0 }), 0)
})

test('FWD clean sheet has no effect on score', () => {
	const fwd = computeFantasyIndex({ ...base, position: 'FWD', cleanSheet: true })
	assert.equal(fwd, computeFantasyIndex({ ...base, position: 'FWD' }))
})

test('GK clean sheet adds +3', () => {
	// 14.35 (MID/base value before cleanSheet bonus) + 3 cleanSheet
	assert.equal(
		computeFantasyIndex({ ...base, position: 'GK', cleanSheet: true }),
		17.35,
	)
})

test('MID with one goal + xG=0.4 computes as expected', () => {
	const out = computeFantasyIndex(base)
	// 90 * .05 + 1*6 + 0 + .4*2 + .1*1 + 2*.5 + 5*.2 + 1*.5 + 3*.15
	// = 4.5 + 6 + 0 + .8 + .1 + 1 + 1 + .5 + .45 = 14.35
	assert.equal(out, 14.35)
})


