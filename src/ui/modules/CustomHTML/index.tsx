'use client'

import moduleProps from '@/lib/moduleProps'
import CSS from './CSS'
import { stegaClean } from '@sanity/client/stega'
import type { ComponentProps } from 'react'
import DOMPurify from 'dompurify'

const ALLOWED_TAGS = [
	'div',
	'span',
	'p',
	'a',
	'br',
	'strong',
	'em',
	'b',
	'i',
	'u',
	'ul',
	'ol',
	'li',
	'blockquote',
	'pre',
	'code',
	'h1',
	'h2',
	'h3',
	'h4',
	'h5',
	'h6',
	'img',
	'figure',
	'figcaption',
	'table',
	'thead',
	'tbody',
	'tr',
	'th',
	'td',
	'hr',
]

const STRIP_TAGS_REGEX = /<(script|iframe|object|embed|style|meta|link)\b[^<]*(?:(?!<\/\1>)<[^<]*)*<\/\1>|<(script|iframe|object|embed|style|meta|link)\b[^>]*\/?>/gi

function stripUnsafeTags(html: string): string {
	return html.replace(STRIP_TAGS_REGEX, '')
}

export default function CustomHTML({
	className,
	html,
	css,
	...props
}: {
	html?: { code: string }
	css?: { code: string }
} & Sanity.Module &
	ComponentProps<'section' | 'script'>) {
	if ((!html?.code && !css?.code) || props?.options?.hidden) return null

	// Defence in depth: strip <script>, <iframe>, <object>, <embed> regardless
	// of DOMPurify config. Editorial HTML must never execute code on the client.
	const cleanCode = stegaClean(stripUnsafeTags(html?.code ?? ''))
	const cleanCss = stegaClean(stripUnsafeTags(css?.code ?? ''))
	const safeHtml = DOMPurify.sanitize(cleanCode, {
		ALLOWED_TAGS,
		ALLOW_DATA_ATTR: false,
		FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'style', 'meta', 'link'],
		FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'style'],
	})

	return (
		<>
			{cleanCss && <CSS code={cleanCss} />}

			{html?.code && (
				<section
					className={stegaClean(className)}
					dangerouslySetInnerHTML={{ __html: safeHtml }}
					{...moduleProps(props)}
				/>
			)}
		</>
	)
}
