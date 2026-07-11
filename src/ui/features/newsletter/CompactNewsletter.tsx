'use client'

import Link from 'next/link'
import { useNewsletterForm } from './useNewsletterForm'
import { SuccessState, SubscribeButton } from './shared'
import type { NewsletterVariantProps } from './types'

export default function CompactNewsletter({
	title,
	description,
}: NewsletterVariantProps) {
	const { email, setEmail, privacyConsent, setPrivacyConsent, isSubmitting, isSuccess, error, setIsFocused, handleSubmit } =
		useNewsletterForm()

	const displayTitle = title || 'Newsletter'
	const displayDescription =
		description || 'Le migliori notizie sportive, ogni mattina nella tua inbox.'

	return (
		<div className="relative overflow-hidden rounded-xl border border-line-soft bg-surface p-5">
			<div className="pointer-events-none absolute -top-12 -right-12 size-32 rounded-full bg-brand/8 blur-3xl" />

			<div className="relative z-10">
				<h3 className="text-xs font-extrabold uppercase tracking-[0.15em] text-accent">
					{displayTitle}
				</h3>
				<p className="mt-1.5 text-[13px] leading-relaxed text-muted">
					{displayDescription}
				</p>

				<form onSubmit={handleSubmit} className="mt-4">
					{!isSuccess ? (
						<div className="flex gap-2">
							<label htmlFor="newsletter-compact-email" className="sr-only">
								Indirizzo email
							</label>
							<input
								id="newsletter-compact-email"
								type="email"
								placeholder="La tua email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								onFocus={() => setIsFocused(true)}
								onBlur={() => setIsFocused(false)}
								className="min-w-0 flex-1 rounded-lg bg-canvas/80 px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-brand/40"
							/>
							<SubscribeButton
								className="shrink-0 rounded-lg px-4 py-2 text-xs"
								isSubmitting={isSubmitting}
							/>
						</div>
					) : (
						<SuccessState />
					)}

					{!isSuccess && (
						<label className="mt-2 flex items-start gap-2">
							<input
								type="checkbox"
								checked={privacyConsent}
								onChange={(e) => setPrivacyConsent(e.target.checked)}
								className="mt-0.5 size-3 shrink-0 accent-brand"
							/>
							<span className="text-[10px] leading-snug text-muted">
								Accetto il trattamento dei dati personali secondo la{' '}
								<Link href="/legal/privacy-policy" className="underline">Privacy Policy</Link>
							</span>
						</label>
					)}
				</form>

			{error && (
				<p className="mt-2 text-xs text-red-500" role="alert">{error}</p>
			)}

				<p className="mt-3 text-[10px] text-muted">Nessuno spam. Cancellati quando vuoi.</p>
			</div>
		</div>
	)
}
