import { createHash, randomBytes, timingSafeEqual as _timingSafeEqual } from 'node:crypto'

export function genToken(bytes = 32): string {
	return randomBytes(bytes).toString('hex')
}

export function sha256(input: string): string {
	return createHash('sha256').update(input).digest('hex')
}

export function safeEqual(a: string, b: string): boolean {
	if (typeof a !== 'string' || typeof b !== 'string') return false
	if (a.length !== b.length) return false
	try {
		return _timingSafeEqual(Buffer.from(a), Buffer.from(b))
	} catch {
		return false
	}
}
