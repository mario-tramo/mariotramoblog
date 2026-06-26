'use client'

import { useScrollProgress } from '@/lib/useScrollProgress'

export default function ScrollProgressBar() {
	const progress = useScrollProgress()

	return (
		<div className="fixed top-[var(--header-height)] left-0 right-0 z-30 h-[3px]">
			<div
				className="h-full bg-accent transition-[width] duration-150 ease-out"
				style={{ width: `${progress}%` }}
				role="progressbar"
				aria-valuenow={Math.round(progress)}
				aria-valuemin={0}
				aria-valuemax={100}
				aria-label="Avanzamento lettura"
			/>
		</div>
	)
}
