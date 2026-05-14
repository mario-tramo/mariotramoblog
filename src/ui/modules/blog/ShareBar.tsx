'use client'

import ClickToCopy from '@/ui/features/ClickToCopy'
import { FaXTwitter, FaFacebookF } from 'react-icons/fa6'
import { VscLink } from 'react-icons/vsc'

const btnClass =
	'grid size-9 place-items-center rounded-full bg-surface-light text-muted transition hover:text-brand'

export default function ShareBar({ title }: { title?: string }) {
	const url = typeof window !== 'undefined' ? window.location.href : ''
	const text = encodeURIComponent(title || '')
	const encodedUrl = encodeURIComponent(url)

	return (
		<div className="ml-auto flex items-center gap-2">
			<a
				href={`https://x.com/intent/tweet?text=${text}&url=${encodedUrl}`}
				target="_blank"
				rel="noopener noreferrer"
				className={btnClass}
				aria-label="Condividi su X"
			>
				<FaXTwitter className="size-4" />
			</a>
			<a
				href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
				target="_blank"
				rel="noopener noreferrer"
				className={btnClass}
				aria-label="Condividi su Facebook"
			>
				<FaFacebookF className="size-4" />
			</a>
			<ClickToCopy
				value={url}
				className={btnClass}
				aria-label="Copia link"
			>
				<VscLink className="size-4" />
			</ClickToCopy>
		</div>
	)
}
