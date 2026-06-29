import moduleProps from '@/lib/moduleProps'
import { stegaClean } from '@sanity/client/stega'
import type { ComponentProps } from 'react'

/**
 * Safe HTML embed for Sanity `custom-html` blocks.
 *
 * SECURITY: this component NEVER executes <script> tags. Per the pre-prod
 * security audit, allowing script execution via `document.createRange()
 * .createContextualFragment()` was a critical XSS vector — any editor with
 * Sanity write access (or a stolen API token) could inject arbitrary JS that
 * ran on every reader's browser.
 *
 * The HTML is sanitized upstream in `CustomHTML/index.tsx` (DOMPurify with
 * a strict allowlist and FORBID_TAGS on script/iframe/object/embed). This
 * component adds one belt-and-suspenders regex strip on the client to make
 * regressions impossible.
 */
const STRIP_TAGS_REGEX = /<(script|iframe|object|embed|style|meta|link)\b[^<]*(?:(?!<\/\1>)<[^<]*)*<\/\1>|<(script|iframe|object|embed|style|meta|link)\b[^>]*\/?>/gi

function stripUnsafeTags(html: string): string {
	return html.replace(STRIP_TAGS_REGEX, '')
}

export default function WithScript({
	className,
	html,
	...props
}: {
	html?: { code: string }
} & Sanity.Module &
	ComponentProps<'section'>) {
	if (!html?.code || props?.options?.hidden) return null

	const safe = stegaClean(stripUnsafeTags(html.code))

	return (
		<section
			className={stegaClean(className)}
			dangerouslySetInnerHTML={{ __html: safe }}
			data-embed="static-html"
			{...moduleProps(props)}
		/>
	)
}
