import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const CONSENT_COOKIE = 'trm_consent'
// 390 days, per EDPB guidance on consent renewal.
const MAX_AGE_SECONDS = 60 * 60 * 24 * 390

type ConsentValue = 'accepted' | 'rejected' | 'pending'

const ALLOWED: ConsentValue[] = ['accepted', 'rejected', 'pending']

/**
 * POST /api/consent — persists the user's cookie consent choice as a
 * first-party cookie (alongside localStorage) so:
 *   1. The choice is verifiable from the server (SSR data hooks can read it).
 *   2. GDPR audit: the consent record exists outside of localStorage.
 *   3. The choice survives clearing localStorage (rare, but possible).
 *
 * The cookie is NOT HttpOnly because the consent value must be readable
 * synchronously by the client-side CookieConsentProvider on first paint.
 * The cookie contains no PII beyond the consent state itself.
 *
 * This cookie is exempt from consent as a "strictly necessary" cookie per
 * EDPB Guidelines 03/2020 §3.6 and is documented in the Cookie Policy.
 */
export async function POST(request: NextRequest) {
	let body: { value?: string }
	try {
		body = await request.json()
	} catch {
		return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
	}

	const value = body?.value as ConsentValue | undefined
	if (!value || !ALLOWED.includes(value)) {
		return NextResponse.json({ error: 'Invalid consent value' }, { status: 400 })
	}

	const jar = await cookies()
	jar.set({
		name: CONSENT_COOKIE,
		value,
		maxAge: value === 'pending' ? 60 * 60 * 24 * 30 : MAX_AGE_SECONDS,
		path: '/',
		sameSite: 'lax',
		// `secure` is forced in Vercel production (HTTPS), harmless in dev.
		secure: process.env.NODE_ENV === 'production',
		httpOnly: false,
	})

	return NextResponse.json({ ok: true, value })
}

/** GET — returns the current cookie state so SSR can read it if needed. */
export async function GET() {
	const jar = await cookies()
	const raw = jar.get(CONSENT_COOKIE)?.value
	const value: ConsentValue = ALLOWED.includes(raw as ConsentValue)
		? (raw as ConsentValue)
		: 'pending'
	return NextResponse.json({ value })
}

/** DELETE — clears the consent cookie (reopens the banner). */
export async function DELETE() {
	const jar = await cookies()
	jar.delete(CONSENT_COOKIE)
	return NextResponse.json({ ok: true })
}
