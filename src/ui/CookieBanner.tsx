'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function CookieBanner() {
	const [visible, setVisible] = useState(false)

	useEffect(() => {
		if (!localStorage.getItem('cookie-consent')) setVisible(true)
	}, [])

	function accept() {
		localStorage.setItem('cookie-consent', 'accepted')
		setVisible(false)
	}

	function reject() {
		localStorage.setItem('cookie-consent', 'rejected')
		setVisible(false)
	}

	if (!visible) return null

	return (
		<div
			role="dialog"
			aria-label="Cookie consent"
			className="fixed bottom-0 left-0 right-0 z-50 border-t border-ink/10 bg-surface p-4 shadow-lg"
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
