'use client'

import Link from 'next/link'
import { useEffect } from 'react'

export default function Error({
	error,
	reset,
}: {
	error: Error & { digest?: string }
	reset: () => void
}) {
	useEffect(() => {
		console.error('[ErrorBoundary]', error)
	}, [error])

	return (
		<>
			<meta name="robots" content="noindex" />
			<section className="flex min-h-[calc(100svh-4rem)] flex-col items-center justify-center px-4 text-center">
			<h1 className="mb-4 text-3xl font-bold sm:text-4xl">
				<span className="text-accent">Errore</span> imprevisto
			</h1>
			<p className="mb-8 max-w-md text-lg text-muted">
				Qualcosa è andato storto. Riprova o torna alla home.
			</p>
			<div className="flex gap-4">
				<button
					onClick={reset}
					className="rounded bg-accent px-8 py-3 text-base font-medium text-white transition-colors hover:bg-accent/80"
				>
					Riprova
				</button>
				<Link
					href="/"
					className="rounded border border-line px-8 py-3 text-base font-medium transition-colors hover:bg-surface"
				>
					Torna alla Home
				</Link>
			</div>
		</section>
		</>
	)
}
