'use client'

import { useState } from 'react'

export function useNewsletterForm() {
	const [email, setEmail] = useState('')
	const [privacyConsent, setPrivacyConsent] = useState(false)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [isSuccess, setIsSuccess] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [isFocused, setIsFocused] = useState(false)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!email) return
		if (!privacyConsent) {
			setError('Devi accettare il trattamento dei dati personali')
			return
		}

		setIsSubmitting(true)
		setError(null)

		try {
			const res = await fetch('/api/newsletter/subscribe', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, privacyConsent: true }),
			})

			if (!res.ok) {
				const data = await res.json()
				throw new Error(data.error || "Errore durante l'iscrizione")
			}

			setIsSuccess(true)
			setEmail('')
			setTimeout(() => setIsSuccess(false), 3000)
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: "Errore durante l'iscrizione. Riprova più tardi.",
			)
		} finally {
			setIsSubmitting(false)
		}
	}

	return {
		email,
		setEmail,
		privacyConsent,
		setPrivacyConsent,
		isSubmitting,
		isSuccess,
		error,
		isFocused,
		setIsFocused,
		handleSubmit,
	}
}
