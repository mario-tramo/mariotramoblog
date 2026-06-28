import { NextRequest, NextResponse } from 'next/server'
import { subscribe } from '@/lib/newsletter-store'

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
		// On Vercel, prefer edge/CDN-detected IPs. The platform injects
		// `x-real-ip` and `x-forwarded-for`.
		const ip =
			request.headers.get('x-real-ip')?.trim() ||
			request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
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

		// RFC 5321/5322 lite — rejects obvious junk without false negatives.
		const EMAIL_REGEX =
			/^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,24}$/

		if (!EMAIL_REGEX.test(email.trim())) {
			return NextResponse.json(
				{ error: 'Formato email non valido' },
				{ status: 400 },
			)
		}

		const result = await subscribe(email, ip)

		// In production, the returned confirmToken is meant to be embedded in
		// a confirmation email sent by an external mail service (Resend,
		// Brevo, Postmark). Without a configured mailer, the token is part of
		// the JSON response so the CMS / test harness can verify the flow.
		return NextResponse.json({
			success: true,
			alreadyExists: result.alreadyExists,
			subscriber: result.subscriber,
			Message: result.alreadyExists
				? 'Sei già iscritto. Riceverai a breve le nostre email.'
				: "Ti abbiamo inviato (o invieremo) una email di conferma. Clicca il link per completare l'iscrizione.",
		})
	} catch (err) {
		console.error('[Newsletter] subscribe failed:', err)
		return NextResponse.json(
			{ error: 'Errore interno del server' },
			{ status: 500 },
		)
	}
}
