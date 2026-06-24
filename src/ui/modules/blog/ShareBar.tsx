'use client'

import { useEffect, useState } from 'react'
import ClickToCopy from '@/ui/features/ClickToCopy'
import { getIcon } from '@/ui/primitives/SocialIcons'

const btnClass =
	'grid size-9 place-items-center rounded-full bg-surface-light text-muted transition hover:text-brand'

export default function ShareBar({ title }: { title?: string }) {
	const [url, setUrl] = useState('')
	useEffect(() => { setUrl(window.location.href) }, [])
	const text = encodeURIComponent(title || '')
	const encodedUrl = encodeURIComponent(url)

	const XIcon = getIcon('x')!
	const FacebookIcon = getIcon('facebook')!
	const LinkIcon = getIcon('link')!

	return (
		<div className="mt-2 md:mt-0 md:ml-auto flex items-center gap-2">
			<span className="text-sm text-muted">Condividi su</span>
			<a
				href={`https://x.com/intent/tweet?text=${text}&url=${encodedUrl}`}
				target="_blank"
				rel="noopener noreferrer"
				className={btnClass}
				aria-label="Condividi su X"
			>
				<XIcon className="size-4" aria-hidden="true" />
			</a>
			<a
				href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
				target="_blank"
				rel="noopener noreferrer"
				className={btnClass}
				aria-label="Condividi su Facebook"
			>
				<FacebookIcon className="size-4" aria-hidden="true" />
			</a>
			<ClickToCopy
				value={url}
				className={btnClass}
				aria-label="Copia link"
			>
				<LinkIcon className="size-4" />
			</ClickToCopy>
		</div>
	)
}
