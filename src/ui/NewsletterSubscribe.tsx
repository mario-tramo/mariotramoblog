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

	const defaultTitle = 'Daily Football In Your Inbox'
	const defaultDescription =
		'Get the best football news, analysis and exclusives every morning.'
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
					? 'flex items-center gap-2 text-[#4fc3dc] text-sm font-semibold'
					: 'bg-[#161b22] border border-[#4fc3dc]/30 rounded p-4 text-center'
			}
		>
			<motion.svg
				className={variant === 'inline' ? 'w-5 h-5' : 'w-8 h-8 mx-auto mb-2'}
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
						className="text-[#4fc3dc]"
						initial={{ pathLength: 0 }}
						animate={{ pathLength: 1 }}
						transition={{ duration: 0.4 }}
					/>
				)}
				<motion.path
					d={variant === 'inline' ? 'M5 12l5 5L20 7' : 'M8 12l3 3 5-6'}
					className="text-[#4fc3dc]"
					variants={checkmarkVariants}
					initial="initial"
					animate="animate"
				/>
			</motion.svg>
			{variant !== 'inline' && (
				<motion.p
					className="text-[#4fc3dc] text-sm font-semibold"
					initial={{ opacity: 0, y: 5 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3 }}
				>
					Welcome aboard!
				</motion.p>
			)}
			{variant === 'inline' && 'Welcome aboard!'}
		</motion.div>
	)

	const SubscribeButton = ({ className }: { className?: string }) => (
		<motion.button
			type="submit"
			disabled={isSubmitting}
			className={`bg-[#4fc3dc] hover:bg-[#3fb3cc] text-[#0d1117] font-semibold text-sm transition-colors relative overflow-hidden disabled:opacity-70 ${className}`}
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
							className="w-4 h-4 border-2 border-[#0d1117]/30 border-t-[#0d1117] rounded-full"
							animate={{ rotate: 360 }}
							transition={{
								duration: 1,
								repeat: Infinity,
								ease: 'linear',
							}}
						/>
						{variant !== 'inline' && 'Subscribing...'}
					</motion.div>
				) : (
					<motion.span
						key="text"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
					>
						Subscribe
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
						className={`rounded-full border-2`}
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
			<span className="text-[#8b949e] text-xs">Join 12,000+ readers</span>
		</div>
	)

	// ── Compact variant ──
	if (variant === 'compact') {
		return (
			<motion.div
				className="bg-[#161b22] border border-[#30363d] p-5 rounded-lg relative overflow-hidden"
				initial={{ opacity: 0, y: 20 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true, margin: '-50px' }}
				transition={{ duration: 0.5, ease: 'easeOut' }}
			>
				<motion.div
					className="absolute inset-0 bg-gradient-to-br from-[#4fc3dc]/10 via-transparent to-[#4fc3dc]/5 pointer-events-none"
					initial={{ opacity: 0 }}
					animate={{ opacity: isFocused ? 1 : 0 }}
					transition={{ duration: 0.3 }}
				/>

				<motion.h3
					className="text-white text-base font-bold uppercase leading-tight mb-4 relative z-10"
					initial={{ opacity: 0, x: -10 }}
					whileInView={{ opacity: 1, x: 0 }}
					viewport={{ once: true }}
					transition={{ delay: 0.1 }}
				>
					{displayTitle}
				</motion.h3>
				<motion.p
					className="text-[#8b949e] text-sm leading-relaxed mb-5 relative z-10"
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
								<motion.div whileTap={{ scale: 0.995 }} className="relative">
									<input
										type="email"
										placeholder="Enter your email"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										onFocus={() => setIsFocused(true)}
										onBlur={() => setIsFocused(false)}
										className="w-full bg-[#161b22] border border-[#30363d] rounded px-3 py-2.5 text-sm text-white placeholder-[#6e7681] focus:outline-none focus:border-[#4fc3dc] mb-3 transition-colors"
									/>
									<motion.div
										className="absolute inset-0 rounded pointer-events-none"
										style={{
											boxShadow: '0 0 0 2px rgba(79, 195, 220, 0.3)',
										}}
										initial={{ opacity: 0 }}
										animate={{ opacity: isFocused ? 1 : 0 }}
										transition={{ duration: 0.2 }}
									/>
								</motion.div>
								<SubscribeButton className="w-full py-2.5 rounded" />
							</motion.div>
						) : (
							<SuccessState />
						)}
					</AnimatePresence>
				</form>

				<motion.div
					className="mt-4 relative z-10"
					initial={{ opacity: 0 }}
					whileInView={{ opacity: 1 }}
					viewport={{ once: true }}
					transition={{ delay: 0.4 }}
				>
					<AvatarRow borderColor="#161b22" />
				</motion.div>
			</motion.div>
		)
	}

	// ── Extended variant ──
	if (variant === 'extended') {
		return (
			<motion.div
				className="bg-[#161b22] border border-[#21262d] rounded-lg p-6 md:p-8 relative overflow-hidden"
				initial={{ opacity: 0, y: 30 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true, margin: '-50px' }}
				transition={{ duration: 0.6, ease: 'easeOut' }}
				whileHover={{ borderColor: 'rgba(79, 195, 220, 0.3)' }}
			>
				<motion.div
					className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-[#4fc3dc]/20 to-transparent rounded-br-full"
					initial={{ scale: 0, opacity: 0 }}
					whileInView={{ scale: 1, opacity: 1 }}
					viewport={{ once: true }}
					transition={{ delay: 0.2, duration: 0.5 }}
				/>
				<motion.div
					className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-[#4fc3dc]/10 to-transparent rounded-tl-full"
					initial={{ scale: 0, opacity: 0 }}
					whileInView={{ scale: 1, opacity: 1 }}
					viewport={{ once: true }}
					transition={{ delay: 0.3, duration: 0.5 }}
				/>

				<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative z-10">
					<motion.div
						className="flex-1"
						initial={{ opacity: 0, x: -20 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true }}
						transition={{ delay: 0.1 }}
					>
						<h3 className="text-white text-xl md:text-2xl font-bold uppercase leading-tight mb-2">
							{displayTitle}
						</h3>
						<p className="text-[#8b949e] text-sm md:text-base">
							{displayDescription}
						</p>
					</motion.div>

					<motion.form
						onSubmit={handleSubmit}
						className="flex flex-col sm:flex-row gap-3 md:w-auto w-full"
						initial={{ opacity: 0, x: 20 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true }}
						transition={{ delay: 0.2 }}
					>
						<AnimatePresence mode="wait">
							{!isSuccess ? (
								<motion.div
									key="form"
									className="flex flex-col sm:flex-row gap-3"
									initial={{ opacity: 1 }}
									exit={{ opacity: 0, scale: 0.95 }}
								>
									<motion.input
										type="email"
										placeholder="Enter your email"
										value={email}
										onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
											setEmail(e.target.value)
										}
										onFocus={() => setIsFocused(true)}
										onBlur={() => setIsFocused(false)}
										className="flex-1 min-w-0 sm:w-64 bg-[#0d1117] border border-[#30363d] rounded px-4 py-2.5 text-sm text-white placeholder-[#6e7681] focus:outline-none focus:border-[#4fc3dc] transition-colors"
										whileFocus={{ scale: 1.02 }}
									/>
									<SubscribeButton className="px-6 py-2.5 rounded whitespace-nowrap" />
								</motion.div>
							) : (
								<SuccessState />
							)}
						</AnimatePresence>
					</motion.form>
				</div>

				<motion.div
					className="mt-5 relative z-10"
					initial={{ opacity: 0, y: 10 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ delay: 0.4 }}
				>
					<AvatarRow borderColor="#161b22" />
				</motion.div>
			</motion.div>
		)
	}

	// ── Inline variant ──
	if (variant === 'inline') {
		return (
			<motion.div
				className="bg-[#0d1117] py-6"
				initial={{ opacity: 0 }}
				whileInView={{ opacity: 1 }}
				viewport={{ once: true }}
				transition={{ duration: 0.5 }}
			>
				<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
					<motion.div
						initial={{ opacity: 0, x: -20 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true }}
						transition={{ delay: 0.1 }}
					>
						<h3 className="text-white text-lg font-bold uppercase mb-1">
							{displayTitle}
						</h3>
						<p className="text-[#8b949e] text-sm">{displayDescription}</p>
					</motion.div>

					<motion.div
						className="flex flex-col sm:flex-row items-start sm:items-center gap-3"
						initial={{ opacity: 0, x: 20 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true }}
						transition={{ delay: 0.2 }}
					>
						<form onSubmit={handleSubmit} className="flex w-full sm:w-auto">
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
											placeholder="Enter your email"
											value={email}
											onChange={(e) => setEmail(e.target.value)}
											className="flex-1 sm:w-56 bg-[#161b22] border border-[#30363d] rounded-l px-3 py-2 text-sm text-white placeholder-[#6e7681] focus:outline-none focus:border-[#4fc3dc] transition-colors"
										/>
										<SubscribeButton className="px-5 py-2 rounded-r whitespace-nowrap" />
									</motion.div>
								) : (
									<SuccessState />
								)}
							</AnimatePresence>
						</form>

						<AvatarRow borderColor="#0d1117" />
					</motion.div>
				</div>
			</motion.div>
		)
	}

	return null
}
