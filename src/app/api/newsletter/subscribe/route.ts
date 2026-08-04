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

// RFC 5321/5322 lite — rejects obvious junk without false negatives.
const EMAIL_REGEX = /^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,24}$/

function isFormRequest(request: NextRequest): boolean {
	const ct = request.headers.get('content-type') ?? ''
	return (
		ct.startsWith('application/x-www-form-urlencoded') ||
		ct.startsWith('multipart/form-data')
	)
}

function escapeHtml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;')
}

// A self-contained page shown to no-JS browsers that submit the native form.
// fetch/JSON clients never see this; they keep receiving JSON.
function htmlPage({
	title,
	message,
	backHref,
	ok,
}: {
	title: string
	message: string
	backHref: string
	ok: boolean
}) {
	const accent = ok ? '#22d3ee' : '#f87171'
	const body = `<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<title>${escapeHtml(title)} — TRM Sport</title>
<style>
body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:#0B1C2C;color:#fff;display:flex;min-height:100vh;align-items:center;justify-content:center;padding:24px;margin:0}
.card{background:#10283E;border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:36px;max-width:430px;text-align:center}
h1{font-size:20px;margin:0 0 12px;color:#fff}
p{color:#cbd5e1;line-height:1.6;margin:0 0 24px}
a{color:${accent};font-weight:600;text-decoration:underline}
</style>
</head>
<body>
<main class="card">
<h1>${escapeHtml(title)}</h1>
<p>${escapeHtml(message)}</p>
<a href="${escapeHtml(backHref)}">Torna al sito</a>
</main>
</body>
</html>`
	return new Response(body, {
		headers: { 'Content-Type': 'text/html; charset=utf-8' },
	})
}

export async function POST(request: NextRequest) {
	try {
		const ip =
			request.headers.get('x-real-ip')?.trim() ||
			request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
			'unknown'

		if (isRateLimited(ip)) {
			if (isFormRequest(request)) {
				return htmlPage({
					title: 'Troppe richieste',
					message: 'Hai effettuato troppe richieste, riprova tra qualche minuto.',
					backHref: request.headers.get('referer') || '/',
					ok: false,
				})
			}
			return NextResponse.json(
				{ error: 'Troppe richieste, riprova tra poco' },
				{ status: 429 },
			)
		}

		const isForm = isFormRequest(request)

		let email = ''
		let privacyConsent = false
		let referer = '/'

		if (isForm) {
			const raw = await request.text().catch(() => '')
			const params = new URLSearchParams(raw)
			email = (params.get('email') ?? '').trim()
			// A native checkbox sends 'on' only when selected.
			privacyConsent = params.has('privacyConsent')
			referer = request.headers.get('referer') || '/'
		} else {
			let body: { email?: string; privacyConsent?: boolean }
			try {
				body = await request.json()
			} catch {
				return NextResponse.json(
					{ error: 'Richiesta malformata' },
					{ status: 400 },
				)
			}
			email = (body.email ?? '').trim()
			privacyConsent = body.privacyConsent === true
		}

		if (!privacyConsent) {
			const msg = 'Devi accettare il trattamento dei dati personali'
			if (isForm) {
				return htmlPage({
					title: 'Consenso richiesto',
					message: msg + '.',
					backHref: referer,
					ok: false,
				})
			}
			return NextResponse.json({ error: msg }, { status: 400 })
		}

		if (!email) {
			const msg = 'Inserisci un indirizzo email'
			if (isForm) {
				return htmlPage({ title: 'Email mancante', message: msg + '.', backHref: referer, ok: false })
			}
			return NextResponse.json({ error: msg }, { status: 400 })
		}

		if (!EMAIL_REGEX.test(email)) {
			const msg = 'Formato email non valido'
			if (isForm) {
				return htmlPage({ title: 'Email non valida', message: msg + '.', backHref: referer, ok: false })
			}
			return NextResponse.json({ error: msg }, { status: 400 })
		}

		const result = await subscribe(email, ip)

		if (isForm) {
			return htmlPage(
				result.alreadyExists
					? {
							title: 'Sei già iscritto',
							message:
								'Sei già iscritto alla newsletter. Riceverai a breve le nostre email.',
							backHref: referer,
							ok: true,
						}
					: {
							title: 'Iscrizione ricevuta',
							message:
								"Ti abbiamo inviato (o invieremo) una email di conferma. Clicca il link per completare l'iscrizione.",
							backHref: referer,
							ok: true,
						},
			)
		}

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
		if (isFormRequest(request)) {
			return htmlPage({
				title: 'Errore interno',
				message: 'Si è verificato un errore. Riprova più tardi.',
				backHref: request.headers.get('referer') || '/',
				ok: false,
			})
		}
		return NextResponse.json(
			{ error: 'Errore interno del server' },
			{ status: 500 },
		)
	}
}