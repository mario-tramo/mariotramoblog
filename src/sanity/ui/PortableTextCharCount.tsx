'use client'

import { useMemo, useRef, useState, useEffect, useCallback } from 'react'
import type { ArrayOfObjectsInputProps } from 'sanity'

function countChars(value: unknown): number {
	if (!Array.isArray(value)) return 0

	let total = 0
	for (const block of value) {
		if (block._type === 'block' && Array.isArray(block.children)) {
			for (const child of block.children) {
				if (typeof child.text === 'string') {
					total += child.text.length
				}
			}
		}
	}
	return total
}

function countWords(value: unknown): number {
	if (!Array.isArray(value)) return 0

	const parts: string[] = []
	for (const block of value) {
		if (block._type === 'block' && Array.isArray(block.children)) {
			for (const child of block.children) {
				if (typeof child.text === 'string') {
					parts.push(child.text)
				}
			}
		}
	}

	const text = parts.join(' ').trim()
	if (!text) return 0
	return text.split(/\s+/).length
}

function estimateReadTime(words: number): number {
	return Math.max(1, Math.ceil(words / 200))
}

const statStyle: React.CSSProperties = {
	display: 'flex',
	alignItems: 'center',
	gap: 6,
}

const valueStyle: React.CSSProperties = {
	color: '#fff',
	fontWeight: 600,
	fontVariantNumeric: 'tabular-nums',
}

const labelStyle: React.CSSProperties = {
	color: '#8a8f98',
}

const separatorStyle: React.CSSProperties = {
	width: 1,
	height: 16,
	background: '#2a2c30',
}

export function PortableTextCharCount(props: ArrayOfObjectsInputProps) {
	const chars = useMemo(() => countChars(props.value), [props.value])
	const words = useMemo(() => countWords(props.value), [props.value])
	const readTime = useMemo(() => estimateReadTime(words), [words])
	const anchorRef = useRef<HTMLDivElement>(null)
	const [pos, setPos] = useState({ left: 0, width: 0 })

	const measure = useCallback(() => {
		const el = anchorRef.current
		if (!el) return
		// Find the document panel (scroll container) that holds this field
		const panel =
			el.closest('[data-testid="document-panel-scroller"]') ||
			el.closest('[data-ui="ScrollContainer"]') ||
			el.closest('main')
		if (panel) {
			const rect = panel.getBoundingClientRect()
			setPos({ left: rect.left, width: rect.width })
		}
	}, [])

	useEffect(() => {
		measure()
		window.addEventListener('resize', measure)
		// Re-measure when panels resize (e.g. sidebar toggle)
		const observer = new ResizeObserver(measure)
		const el = anchorRef.current
		const panel =
			el?.closest('[data-testid="document-panel-scroller"]') ||
			el?.closest('[data-ui="ScrollContainer"]') ||
			el?.closest('main')
		if (panel) observer.observe(panel)
		return () => {
			window.removeEventListener('resize', measure)
			observer.disconnect()
		}
	}, [measure])

	const barStyle: React.CSSProperties = {
		position: 'fixed',
		bottom: 51,
		left: pos.left,
		width: pos.width || '50%',
		zIndex: 999999,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 24,
		padding: '10px 20px',
		background: '#101112',
		borderTop: '1px solid #2a2c30',
		fontFamily:
			'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
		fontSize: 13,
		letterSpacing: '0.01em',
		boxSizing: 'border-box',
	}

	return (
		<div ref={anchorRef} lang="it" spellCheck>
			{props.renderDefault(props)}
			<div style={barStyle}>
				<div style={statStyle}>
					<span style={valueStyle}>
						{words.toLocaleString('it-IT')}
					</span>
					<span style={labelStyle}>parole</span>
				</div>
				<div style={separatorStyle} />
				<div style={statStyle}>
					<span style={valueStyle}>
						{chars.toLocaleString('it-IT')}
					</span>
					<span style={labelStyle}>caratteri</span>
				</div>
				<div style={separatorStyle} />
				<div style={statStyle}>
					<span style={valueStyle}>~{readTime}</span>
					<span style={labelStyle}>min lettura</span>
				</div>
			</div>
		</div>
	)
}
