import { NextRequest, NextResponse } from 'next/server'
import { addSubscriber } from '@/lib/newsletter-store'

const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX = 5

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function isRateLimited(ip: string): boolean {
	const now = Date.now()
	const entry = rateLimitMap.get(ip)

	if (!entry || now > entry.resetAt) {
		rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW })
		return false
	}

	entry.count++
	return entry.count > RATE_LIMIT_MAX
}

export async function POST(request: NextRequest) {
	try {
		const ip =
			request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
			'unknown'

		if (isRateLimited(ip)) {
			return NextResponse.json(
				{ error: 'Troppe richieste, riprova tra poco' },
				{ status: 429 },
			)
		}

		let body: { email?: string }
		try {
			body = await request.json()
		} catch {
			return NextResponse.json(
				{ error: 'Richiesta malformata' },
				{ status: 400 },
			)
		}

		const { email } = body

		if (!email || typeof email !== 'string') {
			return NextResponse.json(
				{ error: 'Email non valida' },
				{ status: 400 },
			)
		}

		const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

		if (!emailRegex.test(email.trim())) {
			return NextResponse.json(
				{ error: 'Formato email non valido' },
				{ status: 400 },
			)
		}

		const result = addSubscriber(email)

		return NextResponse.json({
			success: true,
			alreadyExists: result.alreadyExists,
			subscriber: result.subscriber,
		})
	} catch (err) {
		console.error('[Newsletter] subscribe failed:', err)
		return NextResponse.json(
			{ error: 'Errore interno del server' },
			{ status: 500 },
		)
	}
}
