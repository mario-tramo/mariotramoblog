'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { useCookieConsent } from './CookieConsent'
import { useFocusTrap } from '@/lib/useFocusTrap'

export default function CookieBanner() {
	const { consent, accept, reject } = useCookieConsent()
	const bannerRef = useFocusTrap<HTMLDivElement>(consent === 'pending')

	useEffect(() => {
		if (consent !== 'pending') return

		function onKeyDown(e: KeyboardEvent) {
			if (e.key === 'Escape') {
				reject()
			}
		}

		document.addEventListener('keydown', onKeyDown)
		return () => document.removeEventListener('keydown', onKeyDown)
	}, [consent, reject])

	if (consent !== 'pending') return null

	return (
		<div
			ref={bannerRef}
			role="dialog"
			aria-label="Consenso cookie"
			aria-modal="true"
			className="fixed bottom-0 left-0 right-0 z-50 bg-surface-light p-4 shadow-2xl shadow-black/40"
		>
			<div className="mx-auto flex max-w-screen-xl flex-wrap items-center justify-between gap-4">
				<p className="text-sm text-muted">
					Utilizziamo cookie tecnici per il funzionamento del sito e, previo
					consenso, cookie analitici.{' '}
					<Link href="/legal/cookie-policy" className="link text-accent">
						Cookie Policy
					</Link>{' '}
					·{' '}
					<Link href="/legal/privacy-policy" className="link text-accent">
						Privacy Policy
					</Link>
				</p>
				<div className="flex gap-3">
					<button onClick={reject} className="action-outline text-sm">
						Rifiuta
					</button>
					<button onClick={accept} className="action text-sm">
						Accetta
					</button>
				</div>
			</div>
		</div>
	)
}
