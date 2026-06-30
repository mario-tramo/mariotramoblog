'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'

export default function Error({
	error,
	reset,
}: {
	error: Error & { digest?: string }
	reset: () => void
}) {
	useEffect(() => {
		Sentry.captureException(error)
	}, [error])

	return (
		<div className="flex min-h-svh flex-col items-center justify-center bg-[#07111F] px-4 text-center text-[#E2E8F0] antialiased">
			<h2 className="mb-4 text-3xl font-bold sm:text-4xl">
				<span className="text-[#0ea5e9]">Errore</span> imprevisto
			</h2>
			<p className="mb-8 max-w-md text-lg text-[#94A3B8]">
				Qualcosa è andato storto. Ricarica la pagina o riprova più tardi.
			</p>
			<button
				onClick={reset}
				className="rounded bg-[#0ea5e9] px-8 py-3 text-base font-medium text-white transition-colors hover:bg-[#0ea5e9]/80"
			>
				Riprova
			</button>
		</div>
	)
}
