'use client'

import { useState } from 'react'

export type NewsletterSubscribeProps = {
	variant?: 'inline' | 'hero' | 'compact'
	title?: string
	description?: string
	placeholder?: string
	buttonLabel?: string
	disclaimer?: string
	onSubmitAction?: (email: string) => Promise<void>
	successMessage?: string
}

export default function NewsletterSubscribe({
	variant = 'inline',
	title = 'Ricevi le ultime notizie sportive',
	description = 'Ogni giorno i migliori aggiornamenti su calcio, tennis, Formula 1 e molto altro.',
	placeholder = 'La tua email',
	buttonLabel = 'Iscriviti gratis',
	disclaimer = 'Niente spam. Puoi disiscriverti in qualsiasi momento.',
	onSubmitAction,
	successMessage = 'Iscrizione avvenuta con successo!',
}: NewsletterSubscribeProps) {
	const [email, setEmail] = useState('')
	const [loading, setLoading] = useState(false)
	const [success, setSuccess] = useState(false)
	const [error, setError] = useState<string | null>(null)

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault()
		setLoading(true)
		setError(null)

		try {
			if (onSubmitAction) {
				await onSubmitAction(email)
			} else {
				const res = await fetch('/api/newsletter/subscribe', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ email }),
				})

				if (!res.ok) {
					const data = await res.json()
					throw new Error(data.error || 'Errore durante l\'iscrizione')
				}
			}

			setSuccess(true)
			setEmail('')
		} catch (err) {
			setError(
				err instanceof Error ? err.message : 'Errore durante l\'iscrizione',
			)
		} finally {
			setLoading(false)
		}
	}

	if (success) {
		return (
			<div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
				{successMessage}
			</div>
		)
	}

	const isInline = variant === 'inline'
	const isHero = variant === 'hero'
	const isCompact = variant === 'compact'

	return (
		<section className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 md:p-8 dark:border-zinc-800 dark:bg-zinc-900">
			<div
				className={
					isInline
						? 'md:flex md:items-center md:justify-between md:gap-8'
						: 'space-y-6'
				}
			>
				<div className={isInline ? 'md:max-w-md' : 'max-w-2xl'}>
					<h2
						className={`font-bold tracking-tight ${isHero ? 'text-3xl md:text-4xl' : isCompact ? 'text-xl' : 'text-2xl'}`}
					>
						{title}
					</h2>
					<p className="mt-2 text-sm text-zinc-600 md:text-base dark:text-zinc-400">
						{description}
					</p>
				</div>

				<form
					onSubmit={handleSubmit}
					className={isInline ? 'mt-6 md:mt-0 md:flex-1' : ''}
				>
					<label htmlFor="newsletter-email" className="sr-only">
						Email
					</label>

					<div className="flex flex-col gap-3 sm:flex-row">
						<input
							id="newsletter-email"
							type="email"
							required
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder={placeholder}
							className="h-12 w-full rounded-xl border border-zinc-300 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-black dark:border-zinc-700 dark:bg-zinc-950"
						/>

						<button
							type="submit"
							disabled={loading}
							className="h-12 whitespace-nowrap rounded-xl bg-black px-6 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
						>
							{loading ? 'Invio...' : buttonLabel}
						</button>
					</div>

					<p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
						{disclaimer}
					</p>

					{error && (
						<p className="mt-2 text-sm text-red-600" aria-live="polite">
							{error}
						</p>
					)}
				</form>
			</div>
		</section>
	)
}
