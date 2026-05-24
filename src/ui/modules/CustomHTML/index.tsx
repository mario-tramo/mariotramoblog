import moduleProps from '@/lib/moduleProps'
import CSS from './CSS'
import WithScript from './WithScript'
import { stegaClean } from 'next-sanity'
import type { ComponentProps } from 'react'
import DOMPurify from 'dompurify'

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

	const cleanCode = stegaClean(html?.code ?? '')

	return (
		<>
			<CSS code={stegaClean(css?.code)} />

			{html?.code &&
				(cleanCode.includes('<script') ? (
					<WithScript
						code={cleanCode}
						className={stegaClean(className)}
						{...props}
					/>
				) : (
					<section
						className={stegaClean(className)}
						dangerouslySetInnerHTML={{
							__html: DOMPurify.sanitize(cleanCode),
						}}
						{...moduleProps(props)}
					/>
				))}
		</>
	)
}
