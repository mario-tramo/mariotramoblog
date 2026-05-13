'use client'

import { motion, AnimatePresence } from 'framer-motion'

const checkmarkVariants = {
	initial: { pathLength: 0 },
	animate: {
		pathLength: 1,
		transition: { duration: 0.5, ease: 'easeOut' as const },
	},
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

const avatars = [{ bg: '#f97316' }, { bg: '#8b5cf6' }, { bg: '#3b82f6' }]

export function SuccessState({ inline }: { inline?: boolean }) {
	return (
		<motion.div
			key="success"
			initial={{ opacity: 0, scale: 0.8 }}
			animate={{ opacity: 1, scale: 1 }}
			className={
				inline
					? 'flex items-center gap-2 text-sm font-semibold text-brand'
					: 'rounded border border-brand/30 bg-surface p-4 text-center'
			}
		>
			<motion.svg
				className={inline ? 'size-5' : 'mx-auto mb-2 size-8'}
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
			>
				{!inline && (
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
					d={inline ? 'M5 12l5 5L20 7' : 'M8 12l3 3 5-6'}
					className="text-brand"
					variants={checkmarkVariants}
					initial="initial"
					animate="animate"
				/>
			</motion.svg>
			{!inline && (
				<motion.p
					className="text-sm font-semibold text-brand"
					initial={{ opacity: 0, y: 5 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3 }}
				>
					Benvenuto a bordo!
				</motion.p>
			)}
			{inline && 'Benvenuto a bordo!'}
		</motion.div>
	)
}

export function SubscribeButton({
	className,
	isSubmitting,
	showLabel = true,
}: {
	className?: string
	isSubmitting: boolean
	showLabel?: boolean
}) {
	return (
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
						{showLabel && 'Iscrizione...'}
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
}

export function AvatarRow({
	borderColor,
	size = 28,
}: {
	borderColor: string
	size?: number
}) {
	return (
		<div className="flex items-center gap-2">
			<div className="flex -space-x-2">
				{avatars.map((avatar, i) => (
					<motion.div
						key={i}
						className="rounded-full border-2"
						style={{
							backgroundColor: avatar.bg,
							borderColor,
							width: size,
							height: size,
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
}
