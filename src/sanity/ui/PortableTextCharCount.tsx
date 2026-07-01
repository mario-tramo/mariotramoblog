'use client'

import { useMemo } from 'react'
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
	const barStyle: React.CSSProperties = {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 24,
		marginBottom: 16,
		padding: '10px 20px',
		background: '#101112',
		borderRadius: 8,
		border: '1px solid #2a2c30',
		fontFamily:
			'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
		fontSize: 13,
		letterSpacing: '0.01em',
		boxSizing: 'border-box',
	}

	return (
		<div lang="it" spellCheck>
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
			{props.renderDefault(props)}
		</div>
	)
}
