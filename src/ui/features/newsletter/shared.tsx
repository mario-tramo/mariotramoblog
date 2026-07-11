'use client'

const avatars = [{ bg: '#f97316' }, { bg: '#8b5cf6' }, { bg: '#3b82f6' }]

export function SuccessState({ inline }: { inline?: boolean }) {
	return (
		<div
			className={
				inline
					? 'flex animate-fade-in items-center gap-2 text-sm font-semibold text-brand'
					: 'animate-fade-in rounded border border-brand/30 bg-surface p-4 text-center'
			}
		>
			<svg
				className={inline ? 'size-5' : 'mx-auto mb-2 size-8'}
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
			>
				{!inline && (
					<circle
						cx="12"
						cy="12"
						r="10"
						className="text-brand"
						strokeDasharray={2 * Math.PI * 10}
						strokeDashoffset={2 * Math.PI * 10}
						style={{ animation: 'draw-circle 0.4s ease-out forwards' }}
					/>
				)}
				<path
					d={inline ? 'M5 12l5 5L20 7' : 'M8 12l3 3 5-6'}
					className="text-brand"
					strokeDasharray={20}
					strokeDashoffset={20}
					style={{ animation: 'draw-check 0.5s ease-out 0.1s forwards' }}
				/>
			</svg>
			{!inline && (
				<p
					className="text-sm font-semibold text-brand"
					style={{ animation: 'fade-in-up 0.3s ease-out 0.3s both' }}
				>
					Benvenuto a bordo!
				</p>
			)}
			{inline && 'Benvenuto a bordo!'}
		</div>
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
		<button
			type="submit"
			disabled={isSubmitting}
			className={`relative overflow-hidden bg-brand-deep text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.02] hover:opacity-90 active:scale-[0.98] disabled:opacity-70 ${className}`}
		>
			<span className="flex items-center justify-center gap-2">
				{isSubmitting ? (
					<>
						<span className="inline-block size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
						{showLabel && 'Iscrizione...'}
					</>
				) : (
					'Iscriviti'
				)}
			</span>
			<span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-[600ms] hover:translate-x-full" />
		</button>
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
					<div
						key={i}
						className="rounded-full border-2"
						style={{
							backgroundColor: avatar.bg,
							borderColor,
							width: size,
							height: size,
							animation: `avatar-enter 0.4s ease-out ${0.3 + i * 0.1}s both`,
						}}
					/>
				))}
			</div>
			<span className="text-xs text-muted">Unisciti a 12.000+ lettori</span>
		</div>
	)
}
