'use client'

import { useEffect } from 'react'

export default function GlobalError({
	error,
	reset,
}: {
	error: Error & { digest?: string }
	reset: () => void
}) {
	useEffect(() => {
		console.error('[GlobalError]', error)
	}, [error])

	return (
		<html>
			<body className="flex min-h-svh flex-col items-center justify-center bg-[#07111F] px-4 text-center text-[#E2E8F0] antialiased">
				<h1 className="sr-only">Errore</h1>
				<h2 className="mb-4 text-3xl font-bold sm:text-4xl">
					<span className="text-[#c62828]">Errore</span> imprevisto
				</h2>
				<p className="mb-8 max-w-md text-lg text-[#94A3B8]">
					Qualcosa è andato storto. Ricarica la pagina o riprova più tardi.
				</p>
				<button
					onClick={reset}
					className="rounded bg-[#c62828] px-8 py-3 text-base font-medium text-white transition-colors hover:bg-[#c62828]/80"
				>
					Riprova
				</button>
			</body>
		</html>
	)
}
