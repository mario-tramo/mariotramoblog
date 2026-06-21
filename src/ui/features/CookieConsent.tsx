'use client'

import {
	createContext,
	useContext,
	useState,
	useEffect,
	useCallback,
	type ReactNode,
} from 'react'

type ConsentStatus = 'pending' | 'accepted' | 'rejected'

interface CookieConsentCtx {
	consent: ConsentStatus
	accept: () => void
	reject: () => void
	requestReconsideration: () => void
}

const STORAGE_KEY = 'cookie-consent'
const CONSENT_MAX_AGE_DAYS = 390 // ~13 months per GDPR

const CookieConsentContext = createContext<CookieConsentCtx>({
	consent: 'pending',
	accept: () => {},
	reject: () => {},
	requestReconsideration: () => {},
})

export function CookieConsentProvider({ children }: { children: ReactNode }) {
	const [consent, setConsent] = useState<ConsentStatus>('pending')

	useEffect(() => {
		try {
			const stored = localStorage.getItem(STORAGE_KEY)
			if (stored) {
				const parsed = JSON.parse(stored)
				const elapsed = Date.now() - (parsed.timestamp ?? 0)
				const maxAge = CONSENT_MAX_AGE_DAYS * 24 * 60 * 60 * 1000

				if (elapsed < maxAge) {
					setConsent(parsed.value as ConsentStatus)
				} else {
					localStorage.removeItem(STORAGE_KEY)
				}
			}
		} catch {
			localStorage.removeItem(STORAGE_KEY)
		}
	}, [])

	const persist = useCallback((value: ConsentStatus) => {
		setConsent(value)
		localStorage.setItem(
			STORAGE_KEY,
			JSON.stringify({ value, timestamp: Date.now() }),
		)
	}, [])

	const accept = useCallback(() => persist('accepted'), [persist])
	const reject = useCallback(() => persist('rejected'), [persist])
	const requestReconsideration = useCallback(() => {
		localStorage.removeItem(STORAGE_KEY)
		setConsent('pending')
	}, [])

	return (
		<CookieConsentContext.Provider value={{ consent, accept, reject, requestReconsideration }}>
			{children}
		</CookieConsentContext.Provider>
	)
}

export function useCookieConsent() {
	return useContext(CookieConsentContext)
}
