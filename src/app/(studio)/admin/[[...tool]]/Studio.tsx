'use client'

import { NextStudio } from 'next-sanity/studio'
import config from '$/sanity.config'
import * as Sentry from '@sentry/nextjs'

function StudioInner() {
	return <NextStudio config={config} />
}

const Studio = Sentry.withErrorBoundary(StudioInner, {
	fallback: (
		<div className="flex min-h-svh flex-col items-center justify-center bg-[#07111F] px-4 text-center text-[#E2E8F0] antialiased">
			<h1 className="mb-4 text-3xl font-bold">
				<span className="text-[#0ea5e9]">Errore</span> imprevisto
			</h1>
			<p className="mb-8 max-w-md text-lg text-[#94A3B8]">
				Qualcosa è andato storto nello Studio. Ricarica la pagina.
			</p>
			<button
				onClick={() => window.location.reload()}
				className="rounded bg-[#0ea5e9] px-8 py-3 text-base font-medium text-white transition-colors hover:bg-[#0ea5e9]/80"
			>
				Ricarica
			</button>
		</div>
	),
})

export default Studio
