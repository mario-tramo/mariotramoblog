/**
 * Fantasy Index — pure scoring function.
 *
 * One match row in → one index number out. No I/O. Unit-tested via
 * `ranking.test.ts`.
 *
 * Weights are deliberately conservative — the goal is a stable,
 * reproducible ranking across the season, not vote replication.
 */

export interface PlayerMatchInput {
	playerId: string
	playerName: string
	team: string
	position: 'GK' | 'DEF' | 'MID' | 'FWD'
	minutes: number
	goals: number
	assists: number
	xG: number
	xA: number
	keyPasses: number
	progressivePasses: number
	tacklesWon: number
	recoveries: number
	cleanSheet: boolean
}

const W = {
	minutes: 0.05,
	goal: 6,
	assist: 4,
	xG: 2,
	xA: 1,
	keyPasses: 0.5,
	progressivePasses: 0.2,
	tacklesWon: 0.5,
	recoveries: 0.15,
	cleanSheet: 3,
}

export function computeFantasyIndex(p: PlayerMatchInput): number {
	if (p.minutes <= 0) return 0

	let s =
		p.minutes * W.minutes +
		p.goals * W.goal +
		p.assists * W.assist +
		p.xG * W.xG +
		p.xA * W.xA +
		p.keyPasses * W.keyPasses +
		p.progressivePasses * W.progressivePasses +
		p.tacklesWon * W.tacklesWon +
		p.recoveries * W.recoveries

	if (p.cleanSheet && (p.position === 'GK' || p.position === 'DEF')) {
		s += W.cleanSheet
	}

	return Math.round(s * 100) / 100
}
