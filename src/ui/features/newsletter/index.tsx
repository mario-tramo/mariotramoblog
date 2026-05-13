'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export type NewsletterSubscribeProps = {
	variant?: 'compact' | 'extended' | 'inline'
	title?: string
	description?: string
}

export default function NewsletterSubscribe({
	variant = 'compact',
	title,
	description,
}: NewsletterSubscribeProps) {
	const [email, setEmail] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [isSuccess, setIsSuccess] = useState(false)
	const [isFocused, setIsFocused] = useState(false)

	const defaultTitle = 'Calcio Quotidiano Nella Tua Inbox'
	const defaultDescription =
		'Ricevi le migliori notizie, analisi ed esclusive ogni mattina.'
	const displayTitle = title || defaultTitle
	const displayDescription = description || defaultDescription

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!email) return

		setIsSubmitting(true)

		try {
			const res = await fetch('/api/newsletter/subscribe', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email }),
			})

			if (!res.ok) {
				const data = await res.json()
				throw new Error(data.error || "Errore durante l'iscrizione")
			}

			setIsSuccess(true)
			setEmail('')
			setTimeout(() => setIsSuccess(false), 3000)
		} catch {
			setIsSubmitting(false)
		} finally {
			setIsSubmitting(false)
		}
	}

	const avatarVariants = {
		initial: { scale: 0, opacity: 0 },
		animate: (i: number) => ({
			scale: 1,
			opacity: 1,
			transition: {
				delay: 0.3 + i * 0.1,
				type: 'spring' as const,
				stiffness: 260,
				damping: 20,
			},
		}),
		hover: { scale: 1.1, y: -2 },
	}

	const checkmarkVariants = {
		initial: { pathLength: 0 },
		animate: {
			pathLength: 1,
			transition: { duration: 0.5, ease: 'easeOut' as const },
		},
	}

	const avatars = [{ bg: '#f97316' }, { bg: '#8b5cf6' }, { bg: '#3b82f6' }]

	const SuccessState = () => (
		<motion.div
			key="success"
			initial={{ opacity: 0, scale: 0.8 }}
			animate={{ opacity: 1, scale: 1 }}
			className={
				variant === 'inline'
					? 'flex items-center gap-2 text-sm font-semibold text-brand'
					: 'rounded border border-brand/30 bg-surface p-4 text-center'
			}
		>
			<motion.svg
				className={variant === 'inline' ? 'size-5' : 'mx-auto mb-2 size-8'}
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
			>
				{variant !== 'inline' && (
					<motion.circle
						cx="12"
						cy="12"
						r="10"
						className="text-brand"
						initial={{ pathLength: 0 }}
						animate={{ pathLength: 1 }}
						transition={{ duration: 0.4 }}
					/>
				)}
				<motion.path
					d={variant === 'inline' ? 'M5 12l5 5L20 7' : 'M8 12l3 3 5-6'}
					className="text-brand"
					variants={checkmarkVariants}
					initial="initial"
					animate="animate"
				/>
			</motion.svg>
			{variant !== 'inline' && (
				<motion.p
					className="text-sm font-semibold text-brand"
					initial={{ opacity: 0, y: 5 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3 }}
				>
					Benvenuto a bordo!
				</motion.p>
			)}
			{variant === 'inline' && 'Benvenuto a bordo!'}
		</motion.div>
	)

	const SubscribeButton = ({ className }: { className?: string }) => (
		<motion.button
			type="submit"
			disabled={isSubmitting}
			className={`relative overflow-hidden bg-brand text-sm font-semibold text-brand-foreground transition-colors hover:opacity-90 disabled:opacity-70 ${className}`}
			whileHover={{ scale: 1.02 }}
			whileTap={{ scale: 0.98 }}
		>
			<AnimatePresence mode="wait">
				{isSubmitting ? (
					<motion.div
						key="loading"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="flex items-center justify-center gap-2"
					>
						<motion.div
							className="size-4 rounded-full border-2 border-brand-foreground/30 border-t-brand-foreground"
							animate={{ rotate: 360 }}
							transition={{
								duration: 1,
								repeat: Infinity,
								ease: 'linear',
							}}
						/>
						{variant !== 'inline' && 'Iscrizione...'}
					</motion.div>
				) : (
					<motion.span
						key="text"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
					>
						Iscriviti
					</motion.span>
				)}
			</AnimatePresence>
			<motion.div
				className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
				initial={{ x: '-100%' }}
				whileHover={{ x: '100%' }}
				transition={{ duration: 0.6 }}
			/>
		</motion.button>
	)

	const AvatarRow = ({ borderColor }: { borderColor: string }) => (
		<div className="flex items-center gap-2">
			<div className="flex -space-x-2">
				{avatars.map((avatar, i) => (
					<motion.div
						key={i}
						className="rounded-full border-2"
						style={{
							backgroundColor: avatar.bg,
							borderColor,
							width: variant === 'inline' ? 24 : 28,
							height: variant === 'inline' ? 24 : 28,
						}}
						custom={i}
						variants={avatarVariants}
						initial="initial"
						whileInView="animate"
						whileHover="hover"
						viewport={{ once: true }}
					/>
				))}
			</div>
			<span className="text-xs text-muted">Unisciti a 12.000+ lettori</span>
		</div>
	)

	// Compact variant
	if (variant === 'compact') {
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
								<SubscribeButton className="w-full rounded-lg py-2.5" />
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

	// Extended variant
	if (variant === 'extended') {
		return (
			<motion.div
				className="relative overflow-hidden rounded-2xl border border-border bg-surface p-6 md:p-8"
				initial={{ opacity: 0, y: 30 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true, margin: '-50px' }}
				transition={{ duration: 0.6, ease: 'easeOut' }}
				whileHover={{ borderColor: 'rgba(0, 212, 255, 0.3)' }}
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
									<motion.input
										type="email"
										placeholder="La tua email"
										value={email}
										onChange={(
											e: React.ChangeEvent<HTMLInputElement>,
										) => setEmail(e.target.value)}
										onFocus={() => setIsFocused(true)}
										onBlur={() => setIsFocused(false)}
										className="min-w-0 flex-1 rounded-lg border border-border bg-canvas px-4 py-2.5 text-sm text-ink placeholder:text-muted focus:border-brand focus:outline-none sm:w-64"
										whileFocus={{ scale: 1.02 }}
									/>
									<SubscribeButton className="whitespace-nowrap rounded-lg px-6 py-2.5" />
								</motion.div>
							) : (
								<SuccessState />
							)}
						</AnimatePresence>
					</motion.form>
				</div>

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

	// Inline variant
	if (variant === 'inline') {
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
											className="min-w-0 flex-1 rounded-l-lg border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-brand focus:outline-none sm:w-56"
										/>
										<SubscribeButton className="whitespace-nowrap rounded-r-lg px-5 py-2" />
									</motion.div>
								) : (
									<SuccessState />
								)}
							</AnimatePresence>
						</form>

						<AvatarRow borderColor="var(--color-canvas)" />
					</motion.div>
				</div>
			</motion.div>
		)
	}

	return null
}
