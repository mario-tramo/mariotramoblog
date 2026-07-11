'use client'

import Link from 'next/link'
import { useNewsletterForm } from './useNewsletterForm'
import { SuccessState, SubscribeButton, AvatarRow } from './shared'
import type { NewsletterVariantProps } from './types'

export default function InlineNewsletter({
	title,
	description,
}: NewsletterVariantProps) {
	const { email, setEmail, privacyConsent, setPrivacyConsent, isSubmitting, isSuccess, error, handleSubmit } =
		useNewsletterForm()

	const displayTitle = title || 'Calcio Quotidiano Nella Tua Inbox'
	const displayDescription =
		description || 'Ricevi le migliori notizie, analisi ed esclusive ogni mattina.'

	return (
		<div className="py-8">
			<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
				<div>
					<h3 className="mb-2 text-lg font-bold uppercase">
						{displayTitle}
					</h3>
					<p className="text-sm text-muted">{displayDescription}</p>
				</div>

				<div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
					<form
						onSubmit={handleSubmit}
						className="flex w-full sm:w-auto"
					>
						{!isSuccess ? (
							<div className="flex w-full sm:w-auto">
								<label htmlFor="newsletter-inline-email" className="sr-only">
									Indirizzo email
								</label>
								<input
									id="newsletter-inline-email"
									type="email"
									placeholder="La tua email"
									value={email}
									onChange={(e) =>
										setEmail(e.target.value)
									}
									className="min-w-0 flex-1 rounded-l-lg bg-surface-light px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand/30 sm:w-56"
								/>
								<SubscribeButton
									className="whitespace-nowrap rounded-r-lg px-5 py-2"
									isSubmitting={isSubmitting}
									showLabel={false}
								/>
							</div>
						) : (
							<SuccessState inline />
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
						<p className="text-xs text-red-500" role="alert">{error}</p>
					)}

					<AvatarRow borderColor="var(--color-canvas)" size={24} />
				</div>
			</div>
		</div>
	)
}
