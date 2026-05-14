'use client'

import { useState, useEffect } from 'react'
import { Palette, X } from 'lucide-react'

const PRESETS = [
	{ name: 'Cyan (default)', value: '#00d4ff' },
	{ name: 'Electric Blue', value: '#3b82f6' },
	{ name: 'Indigo', value: '#6366f1' },
	{ name: 'Purple', value: '#a855f7' },
	{ name: 'Fuchsia', value: '#d946ef' },
	{ name: 'Rose', value: '#f43f5e' },
	{ name: 'Orange', value: '#f97316' },
	{ name: 'Amber', value: '#f59e0b' },
	{ name: 'Lime', value: '#84cc16' },
	{ name: 'Emerald', value: '#10b981' },
	{ name: 'Teal', value: '#14b8a6' },
	{ name: 'Sky', value: '#0ea5e9' },
]

const DEFAULT_COLOR = '#00d4ff'
const STORAGE_KEY = 'dev-color-switcher'

export default function DevColorSwitcher() {
	const [open, setOpen] = useState(false)
	const [color, setColor] = useState(DEFAULT_COLOR)

	useEffect(() => {
		try {
			const saved = localStorage.getItem(STORAGE_KEY)
			if (saved) setColor(saved)
		} catch {}
	}, [])

	useEffect(() => {
		const root = document.documentElement
		root.style.setProperty('--color-accent', color)
		root.style.setProperty('--color-brand', color)
		localStorage.setItem(STORAGE_KEY, color)
	}, [color])

	function reset() {
		setColor(DEFAULT_COLOR)
	}

	return (
		<div
			className="fixed bottom-3 right-16 z-[9999]"
			style={{ fontFamily: 'system-ui, sans-serif' }}
		>
			{!open && (
				<button
					onClick={() => setOpen(true)}
					className="grid size-10 place-items-center rounded-full shadow-lg transition hover:scale-110"
					style={{ backgroundColor: color, color: '#0a0f1a' }}
					title="Color Switcher"
				>
					<Palette className="size-5" />
				</button>
			)}

			{open && (
				<div
					className="w-72 rounded-xl border border-border bg-surface p-4 shadow-2xl"
					style={{ fontFamily: 'system-ui, sans-serif' }}
				>
					<div className="mb-3 flex items-center justify-between">
						<span
							className="text-xs font-bold tracking-widest"
							style={{ color }}
						>
							COLOR SWITCHER
						</span>
						<button
							onClick={() => setOpen(false)}
							className="text-muted transition hover:text-ink"
						>
							<X className="size-4" />
						</button>
					</div>

					{/* Color picker */}
					<label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-muted">
						Custom
					</label>
					<div className="mb-3 flex items-center gap-2">
						<input
							type="color"
							value={color}
							onChange={(e) => setColor(e.target.value)}
							className="size-8 cursor-pointer rounded border border-border bg-transparent"
						/>
						<input
							type="text"
							value={color}
							onChange={(e) => setColor(e.target.value)}
							className="min-w-0 flex-1 rounded-lg border border-border bg-canvas px-2 py-1.5 text-xs text-ink"
							spellCheck={false}
						/>
					</div>

					{/* Presets grid */}
					<label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-muted">
						Presets
					</label>
					<div className="mb-3 grid grid-cols-6 gap-1.5">
						{PRESETS.map((p) => (
							<button
								key={p.value}
								onClick={() => setColor(p.value)}
								className="size-8 rounded-lg border-2 transition hover:scale-110"
								style={{
									backgroundColor: p.value,
									borderColor:
										color === p.value
											? 'white'
											: 'transparent',
								}}
								title={p.name}
							/>
						))}
					</div>

					{/* Preview */}
					<div className="mb-3 rounded-lg border border-border bg-canvas p-3">
						<p className="text-lg font-bold leading-tight" style={{ color }}>
							TM Sport
						</p>
						<p className="mt-1 text-xs text-muted">
							Attivo:{' '}
							<strong style={{ color }}>{color}</strong>
						</p>
					</div>

					<button
						onClick={reset}
						className="w-full rounded-lg border border-border py-1.5 text-xs font-medium text-muted transition hover:text-ink"
					>
						Reset
					</button>
				</div>
			)}
		</div>
	)
}
