'use client'

import { useState, type ComponentProps } from 'react'
import { Check, Copy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/ui/features/Toast'

export default function ClickToCopy({
	value,
	className,
	children = <Copy className="size-4" />,
	childrenWhenCopied = <Check className="size-4" />,
	toastMessage = 'Link copiato!',
	...props
}: {
	value?: string
	childrenWhenCopied?: React.ReactNode
	toastMessage?: string
} & ComponentProps<'button'>) {
	const [copied, setCopied] = useState(false)
	const toast = useToast()

	return (
		<button
			className={cn('cursor-copy', copied && 'pointer-events-none', className)}
			onClick={() => {
				if (typeof window === 'undefined' || !value) return

				navigator.clipboard.writeText(value)

				setCopied(true)
				toast(toastMessage)
				setTimeout(() => setCopied(false), 1000)
			}}
			title="Copia negli appunti"
			aria-label="Copia negli appunti"
			{...props}
		>
			{copied ? childrenWhenCopied : children}
		</button>
	)
}
