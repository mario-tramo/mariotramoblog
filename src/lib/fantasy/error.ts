/**
 * Fantasy Error taxonomy.
 *
 * Mirrors `StandingsError` from `src/lib/football-data.ts`. Routes throw
 * this; `.code` lets callers decide whether to bubble, fall back to
 * stale data, or surface a user-facing message.
 */

export const FantasyErrorCode = {
	UNAUTHORIZED: 'UNAUTHORIZED',
	BAD_PAYLOAD: 'BAD_PAYLOAD',
	STORE_UNAVAILABLE: 'STORE_UNAVAILABLE',
	NOT_FOUND: 'NOT_FOUND',
} as const

type FantasyErrorCodeValue = (typeof FantasyErrorCode)[keyof typeof FantasyErrorCode]

export class FantasyError extends Error {
	code: FantasyErrorCodeValue
	constructor(code: FantasyErrorCodeValue, message: string) {
		super(message)
		this.code = code
		this.name = 'FantasyError'
	}
}
