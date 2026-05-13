'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useNewsletterForm } from './useNewsletterForm'
import { SuccessState, SubscribeButton } from './shared'
import type { NewsletterVariantProps } from './types'

export default function CompactNewsletter({
	title,
	description,
}: NewsletterVariantProps) {
	const { email, setEmail, isSubmitting, isSuccess, isFocused, setIsFocused, handleSubmit } =
		useNewsletterForm()

	const displayTitle = title || 'Calcio Quotidiano Nella Tua Inbox'
	const displayDescription =
		description || 'Ricevi le migliori notizie, analisi ed esclusive ogni mattina.'

	return (
		<motion.div
			className="relative overflow-hidden rounded-2xl border border-border bg-surface p-4 sm:p-5"
			initial={{ opacity: 0, y: 20 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, margin: '-50px' }}
			transition={{ duration: 0.5, ease: 'easeOut' }}
		>
			<motion.div
				className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand/10 via-transparent to-brand/5"
				initial={{ opacity: 0 }}
				animate={{ opacity: isFocused ? 1 : 0 }}
				transition={{ duration: 0.3 }}
			/>

			<motion.h3
				className="relative z-10 mb-1 text-base font-extrabold uppercase leading-tight"
				initial={{ opacity: 0, x: -10 }}
				whileInView={{ opacity: 1, x: 0 }}
				viewport={{ once: true }}
				transition={{ delay: 0.1 }}
			>
				{displayTitle}
			</motion.h3>
			<motion.p
				className="relative z-10 mb-4 text-xs text-muted"
				initial={{ opacity: 0 }}
				whileInView={{ opacity: 1 }}
				viewport={{ once: true }}
				transition={{ delay: 0.2 }}
			>
				{displayDescription}
			</motion.p>

			<form onSubmit={handleSubmit} className="relative z-10">
				<AnimatePresence mode="wait">
					{!isSuccess ? (
						<motion.div
							key="form"
							initial={{ opacity: 1 }}
							exit={{ opacity: 0, scale: 0.95 }}
						>
							<input
								type="email"
								placeholder="La tua email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								onFocus={() => setIsFocused(true)}
								onBlur={() => setIsFocused(false)}
								className="mb-3 w-full rounded-lg border border-border bg-canvas px-3 py-2.5 text-sm text-ink placeholder:text-muted focus:border-brand/40 focus:outline-none focus:ring-2 focus:ring-brand/40"
							/>
							<SubscribeButton
								className="w-full rounded-lg py-2.5"
								isSubmitting={isSubmitting}
							/>
						</motion.div>
					) : (
						<SuccessState />
					)}
				</AnimatePresence>
			</form>

			<motion.div
				className="relative z-10 mt-3 text-center"
				initial={{ opacity: 0 }}
				whileInView={{ opacity: 1 }}
				viewport={{ once: true }}
				transition={{ delay: 0.4 }}
			>
				<p className="text-[11px] text-muted">Unisciti a 12.000+ lettori</p>
			</motion.div>
		</motion.div>
	)
}
