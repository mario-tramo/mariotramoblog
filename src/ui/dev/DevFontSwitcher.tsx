'use client'

import { useState, useEffect } from 'react'
import { Type, X } from 'lucide-react'

const GOOGLE_FONTS = [
	// Sans-serif
	'Inter',
	'DM Sans',
	'Plus Jakarta Sans',
	'Outfit',
	'Manrope',
	'Sora',
	'Space Grotesk',
	'Figtree',
	'Geist',
	// Serif
	'Playfair Display',
	'Lora',
	'Merriweather',
	'Source Serif 4',
	'Fraunces',
	'DM Serif Display',
	'Libre Baskerville',
	// Monospace
	'JetBrains Mono',
	'Fira Code',
	'IBM Plex Mono',
	// Condensed / Sport-style
	'Barlow Condensed',
	'Oswald',
	'Bebas Neue',
	'Anton',
	'Teko',
	'Rajdhani',
	'Big Shoulders Display',
]

const STORAGE_KEY = 'dev-font-switcher'

function loadGoogleFont(family: string) {
	const id = `gf-${family.replace(/\s+/g, '-')}`
	if (document.getElementById(id)) return

	const link = document.createElement('link')
	link.id = id
	link.rel = 'stylesheet'
	link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@300;400;500;600;700;800;900&display=swap`
	document.head.appendChild(link)
}

export default function DevFontSwitcher() {
	const [open, setOpen] = useState(false)
	const [font, setFont] = useState('')
	const [customFont, setCustomFont] = useState('')
	const [extraFonts, setExtraFonts] = useState<string[]>([])

	// Restore from localStorage
	useEffect(() => {
		try {
			const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
			if (saved.font) {
				setFont(saved.font)
				loadGoogleFont(saved.font)
			}
			if (saved.extraFonts) {
				setExtraFonts(saved.extraFonts)
			}
		} catch { }
	}, [])

	// Apply font globally
	useEffect(() => {
		const style = document.getElementById('dev-font-overrides')

		if (font) {
			const el = style || document.createElement('style')
			el.id = 'dev-font-overrides'
			el.textContent = `
				*, *::before, *::after {
					font-family: "${font}", sans-serif !important;
				}
			`
			if (!style) document.head.appendChild(el)
		} else if (style) {
			style.remove()
		}

		localStorage.setItem(
			STORAGE_KEY,
			JSON.stringify({ font, extraFonts }),
		)
	}, [font, extraFonts])

	function applyFont(f: string) {
		if (f) loadGoogleFont(f)
		setFont(f)
	}

	function addCustomFont() {
		const name = customFont.trim()
		if (!name) return
		loadGoogleFont(name)
		setExtraFonts((prev) => [...new Set([...prev, name])])
		applyFont(name)
		setCustomFont('')
	}

	const allFonts = [...GOOGLE_FONTS, ...extraFonts]

	return (
		<div className="fixed right-3 bottom-3 z-[9999]" style={{ fontFamily: 'system-ui, sans-serif' }}>
			{!open && (
				<button
					onClick={() => setOpen(true)}
					className="grid size-10 place-items-center rounded-full bg-brand text-brand-foreground shadow-lg transition hover:scale-110"
					title="Font Switcher"
				>
					<Type className="size-5" />
				</button>
			)}

			{open && (
				<div
					className="w-72 rounded-xl border border-line bg-surface p-4 shadow-2xl"
					style={{ fontFamily: 'system-ui, sans-serif' }}
				>
					<div className="mb-3 flex items-center justify-between">
						<span className="text-xs font-bold tracking-widest text-brand">
							FONT SWITCHER
						</span>
						<button
							onClick={() => setOpen(false)}
							className="text-muted transition hover:text-ink"
						>
							<X className="size-4" />
						</button>
					</div>

					{/* Font select */}
					<label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-muted">
						Font
					</label>
					<select
						value={font}
						onChange={(e) => applyFont(e.target.value)}
						className="mb-3 w-full rounded-lg border border-line bg-canvas px-2 py-1.5 text-xs text-ink"
					>
						<option value="">Default</option>
						{allFonts.map((f) => (
							<option key={f} value={f}>
								{f}
							</option>
						))}
					</select>

					{/* Custom font input */}
					<label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-muted">
						Google Font custom
					</label>
					<div className="mb-3 flex gap-1">
						<input
							type="text"
							value={customFont}
							onChange={(e) => setCustomFont(e.target.value)}
							onKeyDown={(e) => e.key === 'Enter' && addCustomFont()}
							placeholder="es. Poppins"
							className="min-w-0 flex-1 rounded-lg border border-line bg-canvas px-2 py-1.5 text-xs text-ink placeholder:text-muted"
						/>
						<button
							onClick={addCustomFont}
							className="rounded-lg bg-brand px-2 py-1.5 text-xs font-semibold text-brand-foreground"
						>
							+
						</button>
					</div>

					{/* Preview */}
					<div className="mb-3 rounded-lg border border-line bg-canvas p-3">
						<p
							className="text-lg font-bold leading-tight"
							style={{ fontFamily: font ? `"${font}", sans-serif` : undefined }}
						>
							TM Sport
						</p>
						<p
							className="mt-1 text-xs text-muted"
							style={{ fontFamily: font ? `"${font}", sans-serif` : undefined }}
						>
							Le migliori notizie di calcio, analisi e opinioni.
						</p>
					</div>

					{font && (
						<p className="mb-2 text-[10px] text-muted">
							Attivo: <strong className="text-ink">{font}</strong>
						</p>
					)}

					<button
						onClick={() => applyFont('')}
						className="w-full rounded-lg border border-line py-1.5 text-xs font-medium text-muted transition hover:text-ink"
					>
						Reset
					</button>
				</div>
			)}
		</div>
	)
}
