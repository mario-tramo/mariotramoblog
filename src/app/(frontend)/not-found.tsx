import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
	title: '404 — Pagina non trovata | Trm Sport',
	description: 'La pagina che stai cercando non esiste o è stata spostata.',
	robots: { index: false, follow: false },
}

export default function NotFound() {
	return (
		<section className="relative flex min-h-[calc(100svh-4rem)] items-center justify-center overflow-hidden">
			{/* Full-screen background */}
			<Image
				src="/images/404_background.png"
				alt=""
				fill
				className="object-cover"
				priority
			/>

			{/* Dark overlay for contrast */}
			<div className="absolute inset-0 bg-black/40" />

			{/* Content */}
			<div className="relative z-10 mx-auto w-full max-w-[1400px] px-5 sm:px-6 lg:flex lg:justify-end">
				<div className="flex flex-col items-center text-center lg:w-1/2 lg:items-start lg:text-left">
					<h1 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl mb-4">
						<span className="text-accent">Oops!</span> Pagina non trovata.
					</h1>
					<p className="mb-8 max-w-md text-lg text-white/70 sm:text-xl">
						Sembra che tu sia finito in fuorigioco.
						<br />
						La pagina che stai cercando non esiste
						<br />
						o è stata spostata.
					</p>
					<Link
						href="/"
						className="rounded bg-accent px-8 py-3 text-base font-medium text-white transition-colors hover:bg-accent/80"
					>
						Torna alla Home
					</Link>
				</div>
			</div>
		</section>
	)
}
