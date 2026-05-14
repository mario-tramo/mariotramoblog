'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useNewsletterForm } from './useNewsletterForm'
import { SuccessState, SubscribeButton, AvatarRow } from './shared'
import type { NewsletterVariantProps } from './types'

export default function InlineNewsletter({
	title,
	description,
}: NewsletterVariantProps) {
	const { email, setEmail, isSubmitting, isSuccess, handleSubmit } =
		useNewsletterForm()

	const displayTitle = title || 'Calcio Quotidiano Nella Tua Inbox'
	const displayDescription =
		description || 'Ricevi le migliori notizie, analisi ed esclusive ogni mattina.'

	return (
		<motion.div
			className="py-6"
			initial={{ opacity: 0 }}
			whileInView={{ opacity: 1 }}
			viewport={{ once: true }}
			transition={{ duration: 0.5 }}
		>
			<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
				<motion.div
					initial={{ opacity: 0, x: -20 }}
					whileInView={{ opacity: 1, x: 0 }}
					viewport={{ once: true }}
					transition={{ delay: 0.1 }}
				>
					<h3 className="mb-1 text-lg font-bold uppercase">
						{displayTitle}
					</h3>
					<p className="text-sm text-muted">{displayDescription}</p>
				</motion.div>

				<motion.div
					className="flex flex-col items-start gap-3 sm:flex-row sm:items-center"
					initial={{ opacity: 0, x: 20 }}
					whileInView={{ opacity: 1, x: 0 }}
					viewport={{ once: true }}
					transition={{ delay: 0.2 }}
				>
					<form
						onSubmit={handleSubmit}
						className="flex w-full sm:w-auto"
					>
						<AnimatePresence mode="wait">
							{!isSuccess ? (
								<motion.div
									key="form"
									className="flex w-full sm:w-auto"
									initial={{ opacity: 1 }}
									exit={{ opacity: 0, scale: 0.95 }}
								>
									<input
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
								</motion.div>
							) : (
								<SuccessState inline />
							)}
						</AnimatePresence>
					</form>

					<AvatarRow borderColor="var(--color-canvas)" size={24} />
				</motion.div>
			</div>
		</motion.div>
	)
}
