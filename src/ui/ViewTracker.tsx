'use client'

import { useEffect } from 'react'
import { useCookieConsent } from './features/CookieConsent'

export default function ViewTracker({ slug }: { slug: string }) {
	const { consent } = useCookieConsent()

	useEffect(() => {
		if (consent === 'accepted') {
			fetch(`/api/views/${slug}`, { method: 'POST' })
		}
	}, [slug, consent])

	return null
}
