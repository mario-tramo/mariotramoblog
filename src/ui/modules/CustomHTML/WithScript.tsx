'use client'

import { ComponentProps, useEffect, useRef, useState } from 'react'
import moduleProps from '@/lib/moduleProps'
import DOMPurify from 'dompurify'

/**
 * @description If the code includes a <script> tag, ensure the script is re-run on each render
 */
export default function WithScript({
	code,
	className,
	...props
}: Sanity.CustomHTML['html'] & Sanity.Module & ComponentProps<'section'>) {
	if (!code) return null

	const ref = useRef<HTMLElement>(null)
	const [firstRender, setFirstRender] = useState(true)

	useEffect(() => {
		if (firstRender) {
			setFirstRender(false)
		} else {
			const sanitized = DOMPurify.sanitize(code, {
				ADD_TAGS: ['script'],
				ADD_ATTR: ['src', 'async', 'defer', 'type'],
				ALLOWED_URI_REGEXP: /^https?:\/\//i,
				ALLOW_DATA_ATTR: false,
				FORCE_BODY: true,
			})
			const parsed = document
				.createRange()
				.createContextualFragment(sanitized)
			ref.current?.appendChild(parsed)
		}
	}, [ref.current, code])

	return <section ref={ref} className={className} {...moduleProps(props)} />
}
