import { timingSafeEqual, randomBytes, createHash } from 'node:crypto'

export function safeEqual(a: string | null | undefined, b: string | null | undefined): boolean {
	if (!a || !b) return false
	const ba = Buffer.from(a)
	const bb = Buffer.from(b)
	if (ba.length !== bb.length) return false
	return timingSafeEqual(ba, bb)
}

export function genToken(bytes: number = 32): string {
	return randomBytes(bytes).toString('hex')
}

export function sha256(value: string): string {
	return createHash('sha256').update(value).digest('hex')
}
