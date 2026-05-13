'use client'

import { useState, type ComponentProps } from 'react'
import { Check, Copy } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function ClickToCopy({
	value,
	className,
	children = <Copy className="size-4" />,
	childrenWhenCopied = <Check className="size-4" />,
	...props
}: {
	value?: string
	childrenWhenCopied?: React.ReactNode
} & ComponentProps<'button'>) {
	const [copied, setCopied] = useState(false)

	return (
		<button
			className={cn('cursor-copy', copied && 'pointer-events-none', className)}
			onClick={() => {
				if (typeof window === 'undefined' || !value) return

				navigator.clipboard.writeText(value)

				setCopied(true)
				setTimeout(() => setCopied(false), 1000)
			}}
			title="Click to copy"
			aria-label="Copia negli appunti"
			{...props}
		>
			{copied ? childrenWhenCopied : children}
		</button>
	)
}
