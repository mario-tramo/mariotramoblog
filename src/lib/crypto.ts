/**
 * Server-side utilities: constant-time comparison + token utils.
 */
import { timingSafeEqual, randomBytes, createHash } from 'node:crypto'

/**
 * Constant-time string comparison. Returns false on length mismatch
 * without leaking length-based timing info beyond the early return.
 *
 * Use for secret/HMAC comparisons where an attacker could otherwise
 * probe byte-by-byte via response timing.
 */
export function safeEqual(a: string | null | undefined, b: string | null | undefined): boolean {
	if (!a || !b) return false
	const ba = Buffer.from(a)
	const bb = Buffer.from(b)
	if (ba.length !== bb.length) return false
	return timingSafeEqual(ba, bb)
}

/** Generate a URL-safe random token of N bytes (default 32, hex-encoded). */
export function genToken(bytes: number = 32): string {
	return randomBytes(bytes).toString('hex')
}

/** Stable hash helper (e.g. for daily-salted IP hashing). */
export function sha256(value: string): string {
	return createHash('sha256').update(value).digest('hex')
}
