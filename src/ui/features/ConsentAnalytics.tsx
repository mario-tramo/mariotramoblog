'use client'

import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { useCookieConsent } from './CookieConsent'

export default function ConsentAnalytics() {
	const { consent } = useCookieConsent()

	if (consent !== 'accepted') return null

	return (
		<>
			<Analytics />
			<SpeedInsights />
		</>
	)
}
