'use client'

import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useNewsletterForm } from './useNewsletterForm'
import { SuccessState, SubscribeButton, AvatarRow } from './shared'
import type { NewsletterVariantProps } from './types'

export default function ExtendedNewsletter({
	title,
	description,
}: NewsletterVariantProps) {
	const { email, setEmail, privacyConsent, setPrivacyConsent, isSubmitting, isSuccess, error, setIsFocused, handleSubmit } =
		useNewsletterForm()

	const displayTitle = title || 'Calcio Quotidiano Nella Tua Inbox'
	const displayDescription =
		description || 'Ricevi le migliori notizie, analisi ed esclusive ogni mattina.'

	return (
		<motion.div
			className="relative overflow-hidden rounded-2xl bg-surface-light p-8 md:p-10"
			initial={{ opacity: 0, y: 30 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, margin: '-50px' }}
			transition={{ duration: 0.6, ease: 'easeOut' }}
		>
			<motion.div
				className="absolute top-0 left-0 size-20 rounded-br-full bg-gradient-to-br from-brand/20 to-transparent"
				initial={{ scale: 0, opacity: 0 }}
				whileInView={{ scale: 1, opacity: 1 }}
				viewport={{ once: true }}
				transition={{ delay: 0.2, duration: 0.5 }}
			/>
			<motion.div
				className="absolute right-0 bottom-0 size-32 rounded-tl-full bg-gradient-to-tl from-brand/10 to-transparent"
				initial={{ scale: 0, opacity: 0 }}
				whileInView={{ scale: 1, opacity: 1 }}
				viewport={{ once: true }}
				transition={{ delay: 0.3, duration: 0.5 }}
			/>

			<div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
				<motion.div
					className="flex-1"
					initial={{ opacity: 0, x: -20 }}
					whileInView={{ opacity: 1, x: 0 }}
					viewport={{ once: true }}
					transition={{ delay: 0.1 }}
				>
					<h3 className="mb-2 text-xl font-bold uppercase leading-tight md:text-2xl">
						{displayTitle}
					</h3>
					<p className="text-sm text-muted md:text-base">
						{displayDescription}
					</p>
				</motion.div>

				<motion.form
					onSubmit={handleSubmit}
					className="flex w-full flex-col gap-3 sm:flex-row md:w-auto"
					initial={{ opacity: 0, x: 20 }}
					whileInView={{ opacity: 1, x: 0 }}
					viewport={{ once: true }}
					transition={{ delay: 0.2 }}
				>
					<AnimatePresence mode="wait">
						{!isSuccess ? (
							<motion.div
								key="form"
								className="flex flex-col gap-3 sm:flex-row"
								initial={{ opacity: 1 }}
								exit={{ opacity: 0, scale: 0.95 }}
							>
								<label htmlFor="newsletter-extended-email" className="sr-only">
									Indirizzo email
								</label>
								<motion.input
									id="newsletter-extended-email"
									type="email"
									placeholder="La tua email"
									value={email}
									onChange={(
										e: React.ChangeEvent<HTMLInputElement>,
									) => setEmail(e.target.value)}
									onFocus={() => setIsFocused(true)}
									onBlur={() => setIsFocused(false)}
									className="min-w-0 flex-1 rounded-lg bg-canvas/60 px-4 py-2.5 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand/30 sm:w-64"
									whileFocus={{ scale: 1.02 }}
								/>
								<SubscribeButton
									className="whitespace-nowrap rounded-lg px-6 py-2.5"
									isSubmitting={isSubmitting}
								/>
							</motion.div>
						) : (
							<SuccessState />
						)}
					</AnimatePresence>
				</motion.form>
			</div>

			{!isSuccess && (
				<label className="relative z-10 mt-3 flex items-start gap-2">
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

			{error && (
				<p className="relative z-10 mt-3 text-sm text-red-500" role="alert">{error}</p>
			)}

			<motion.div
				className="relative z-10 mt-5"
				initial={{ opacity: 0, y: 10 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true }}
				transition={{ delay: 0.4 }}
			>
				<AvatarRow borderColor="var(--color-surface)" />
			</motion.div>
		</motion.div>
	)
}
