'use client'

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import type { Standing } from '@/lib/football-data'
import { useFocusTrap } from '@/lib/useFocusTrap'
import StandingsTable from './StandingsTable'

export default function StandingsModal({
	open,
	onClose,
	competitionName,
	currentMatchday,
	rows,
	triggerRef,
	titleId,
}: {
	open: boolean
	onClose: () => void
	competitionName: string
	currentMatchday?: number
	rows: Standing[]
	triggerRef: React.RefObject<HTMLButtonElement | null>
	titleId: string
}) {
	const closeRef = useRef<HTMLButtonElement>(null)
	const dialogRef = useFocusTrap<HTMLDivElement>(open)

	useEffect(() => {
		if (!open) return

		const previousOverflow = document.body.style.overflow
		document.body.style.overflow = 'hidden'
		closeRef.current?.focus()

		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === 'Escape') onClose()
		}

		document.addEventListener('keydown', handleKeyDown)
		return () => {
			document.removeEventListener('keydown', handleKeyDown)
			document.body.style.overflow = previousOverflow
			triggerRef.current?.focus()
		}
	}, [open, onClose, triggerRef])

	if (!open) return null

	return createPortal(
		<div
			ref={dialogRef}
			className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6"
			role="dialog"
			aria-modal="true"
			aria-labelledby={titleId}
		>
			<button
				type="button"
				className="absolute inset-0 cursor-default bg-canvas/80 backdrop-blur-sm"
				tabIndex={-1}
				onClick={onClose}
				aria-label="Chiudi classifica"
			/>
			<div className="relative z-10 flex max-h-[min(820px,calc(100svh-1.5rem))] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-2xl sm:max-h-[calc(100svh-3rem)]">
				<header className="flex shrink-0 items-start justify-between gap-4 border-b border-line-soft px-4 py-4 sm:px-6">
					<div>
						<p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand">Classifica</p>
						<h2 id={titleId} className="mt-1 font-heading text-3xl uppercase leading-none tracking-tight text-ink sm:text-4xl">
							{competitionName}
						</h2>
						{currentMatchday != null && currentMatchday > 0 && (
							<p className="mt-1 text-xs text-muted">Giornata {currentMatchday}</p>
						)}
					</div>
					<button
						ref={closeRef}
						type="button"
						onClick={onClose}
						className="grid size-9 shrink-0 place-items-center rounded-full text-muted transition hover:bg-white/10 hover:text-ink"
						aria-label="Chiudi classifica"
					>
						<X className="size-5" aria-hidden="true" />
					</button>
				</header>
				<div className="min-h-0 overflow-y-auto p-3 sm:p-6">
					<StandingsTable rows={rows} />
				</div>
			</div>
		</div>,
		document.body,
	)
}
