'use client'

import { useId, useRef, useState } from 'react'
import type { Standing } from '@/lib/football-data'
import StandingsTable from './StandingsTable'
import StandingsModal from './StandingsModal'

export default function StandingsClient({
	competitionName,
	currentMatchday,
	rows,
	inline,
	mobileRows,
	desktopRows,
}: {
	competitionName: string
	currentMatchday?: number
	rows: Standing[]
	inline: boolean
	mobileRows: '5' | '10' | 'all'
	desktopRows: '5' | '10' | 'all'
}) {
	const [modalOpen, setModalOpen] = useState(false)
	const triggerRef = useRef<HTMLButtonElement>(null)
	const titleId = `standings-modal-title-${useId().replace(/:/g, '')}`
	const mobileLimit = mobileRows === 'all' ? rows.length : Number(mobileRows)
	const desktopLimit = desktopRows === 'all' ? rows.length : Number(desktopRows)
	const hasHiddenRows = rows.some(
		(_, index) => index >= mobileLimit || index >= desktopLimit,
	)
	const previewContent = (
		<div className="relative">
			<div className="max-h-[260px] overflow-hidden rounded-md">
				<StandingsTable
					rows={rows}
					compact
					mobileRows={mobileRows === 'all' ? rows.length : Number(mobileRows)}
					desktopRows={desktopRows === 'all' ? rows.length : Number(desktopRows)}
					inline={inline}
				/>
			</div>
			{hasHiddenRows && (
				<div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-surface via-surface/85 to-transparent" />
			)}
		</div>
	)

	return (
		<>
			{previewContent}
			{hasHiddenRows && (
				<button
					ref={triggerRef}
					type="button"
					onClick={() => setModalOpen(true)}
					className="mt-3 inline-flex items-center text-xs font-bold uppercase tracking-[0.12em] text-brand transition hover:text-ink hover:underline"
					aria-haspopup="dialog"
				>
					Mostra classifica completa <span className="ml-1" aria-hidden="true">→</span>
				</button>
			)}
			<StandingsModal
				open={modalOpen}
				onClose={() => setModalOpen(false)}
				competitionName={competitionName}
				currentMatchday={currentMatchday}
				rows={rows}
				triggerRef={triggerRef}
				titleId={titleId}
			/>
		</>
	)
}
