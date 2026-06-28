import { NextRequest, NextResponse } from 'next/server'
import { unsubscribe } from '@/lib/newsletter-store'

/**
 * GET  /api/newsletter/unsubscribe?token=<unsub-token>
 * POST /api/newsletter/unsubscribe   { email }
 *
 * One-click unsub via token (preferred — included in every newsletter email),
 * or by email address. Implements GDPR art. 7(3) right to revoke consent
 * with as little friction as possible.
 */
async function handleRequest(request: NextRequest): Promise<NextResponse> {
	try {
		let token: string | undefined
		let email: string | undefined

		if (request.method === 'GET') {
			token = request.nextUrl.searchParams.get('token')?.trim() || undefined
			email = request.nextUrl.searchParams.get('email')?.trim() || undefined
		} else {
			try {
				const body = await request.json()
				email = typeof body?.email === 'string' ? body.email.trim() : undefined
			} catch {
				// ignore for GET
			}
		}

		if (!token && !email) {
			return new NextResponse(
				renderPage(
					'Parametro mancante',
					'Per cancellarti è necessario il link presente in fondo a ogni email, oppure il tuo indirizzo email.',
					false,
				),
				{ status: 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
			)
		}

		const result = await unsubscribe({ token, email })

		if (!result.ok) {
			return new NextResponse(
				renderPage(
					'Non trovato',
					'L\'indirizzo richiesto non risulta iscritto, oppure il link è già stato usato.',
					false,
				),
				{
					status: 404,
					headers: {
						'Content-Type': 'text/html; charset=utf-8',
						'X-Robots-Tag': 'noindex',
						'Cache-Control': 'no-store',
					},
				},
			)
		}

		return new NextResponse(
			renderPage(
				'Iscrizione revocata',
				'Non riceverai più email da Trm Sport. I tuoi dati sono stati cancellati dal nostro archivio.',
				true,
			),
			{
				status: 200,
				headers: {
					'Content-Type': 'text/html; charset=utf-8',
					'X-Robots-Tag': 'noindex',
					'Cache-Control': 'no-store',
				},
			},
		)
	} catch (err) {
		console.error('[Newsletter] unsubscribe failed:', err)
		return new NextResponse(
			renderPage(
				'Errore tecnico',
				'Non è stato possibile completare la richiesta. Riprova più tardi o contattaci a info@trmsport.com.',
				false,
			),
			{ status: 500, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
		)
	}
}

export const GET = handleRequest
export const POST = handleRequest

function renderPage(title: string, body: string, success: boolean): string {
	const accent = success ? '#0ea5e9' : '#f87171'
	return `<!doctype html><html lang="it"><head>
<meta charset="utf-8">
<title>${escape(title)} — Trm Sport</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<style>
body{font-family:system-ui,-apple-system,sans-serif;background:#0a0f1c;color:#e2e8f0;
margin:0;padding:2rem;min-height:100vh;display:flex;align-items:center;justify-content:center}
main{max-width:480px;background:#0d1b2e;border:1px solid ${accent}55;
border-radius:16px;padding:2.5rem;box-shadow:0 24px 60px rgba(0,0,0,.4);text-align:center}
h1{font-size:1.5rem;color:${accent};margin:0 0 1rem}
p{line-height:1.6;margin:0 0 1.5rem}
a.btn{display:inline-block;background:#0ea5e9;color:#fff;text-decoration:none;
padding:.75rem 1.5rem;border-radius:8px;font-weight:600}
</style></head>
<body><main role="main">
<h1>${escape(title)}</h1>
<p>${escape(body)}</p>
<a class="btn" href="/">Torna al sito</a>
</main></body></html>`
}

function escape(s: string): string {
	return s.replace(/[&<>"']/g, (c) =>
		c === '&' ? '&amp;' : c === '<' ? '&lt;' : c === '>' ? '&gt;' : c === '"' ? '&quot;' : '&#39;',
	)
}
