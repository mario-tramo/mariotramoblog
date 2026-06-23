'use client'

import { useEffect, useState } from 'react'
import ClickToCopy from '@/ui/features/ClickToCopy'
import { getIcon } from '@/ui/primitives/SocialIcons'
import type { SVGProps } from 'react'

type IconComponent = (props: SVGProps<SVGSVGElement>) => React.ReactNode

const socials: { label: string; icon: IconComponent; href: (url: string, title?: string) => string }[] = [
	{
		label: 'Facebook',
		icon: getIcon('facebook')!,
		href: (url: string) =>
			`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
	},
	{
		label: 'X',
		icon: getIcon('x')!,
		href: (url: string, title: string = '') =>
			`https://x.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
	},
	{
		label: 'WhatsApp',
		icon: getIcon('whatsapp')!,
		href: (url: string, title: string = '') =>
			`https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' ' + url)}`,
	},
	{
		label: 'LinkedIn',
		icon: getIcon('linkedin')!,
		href: (url: string) =>
			`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
	},
	{
		label: 'Telegram',
		icon: getIcon('telegram')!,
		href: (url: string, title: string = '') =>
			`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
	},
	{
		label: 'Reddit',
		icon: getIcon('reddit')!,
		href: (url: string, title: string = '') =>
			`https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
	},
]

const btnClass =
	'grid size-11 place-items-center rounded border border-line bg-surface text-ink transition hover:bg-ink hover:text-canvas'

export default function ShareBarFooter({ title }: { title?: string }) {
	const [url, setUrl] = useState('')
	useEffect(() => { setUrl(window.location.href) }, [])
	const t = title || ''
	const LinkIcon = getIcon('link')!

	return (
		<div className="mt-10 flex flex-col items-center gap-3">
			<p className="text-sm font-medium text-muted">
				Condividi con un amico:
			</p>
			<div className="flex flex-wrap items-center justify-center gap-2">
				{socials.map(({ label, icon: Icon, href }) => (
					<a
						key={label}
						href={href(url, t)}
						target="_blank"
						rel="noopener noreferrer"
						className={btnClass}
						aria-label={`Condividi su ${label}`}
					>
						<Icon className="size-5" aria-hidden="true" />
					</a>
				))}
				<ClickToCopy
					value={url}
					className={btnClass}
					aria-label="Copia link"
				>
					<LinkIcon className="size-5" aria-hidden="true" />
				</ClickToCopy>
			</div>
		</div>
	)
}
