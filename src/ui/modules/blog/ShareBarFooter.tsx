'use client'

import {
	FaFacebookF,
	FaXTwitter,
	FaLinkedinIn,
	FaTelegram,
	FaWhatsapp,
	FaRedditAlien,
} from 'react-icons/fa6'
import { IoIosLink } from 'react-icons/io'
import ClickToCopy from '@/ui/features/ClickToCopy'

const socials = [
	{
		label: 'Facebook',
		icon: FaFacebookF,
		href: (url: string) =>
			`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
	},
	{
		label: 'X',
		icon: FaXTwitter,
		href: (url: string, title: string) =>
			`https://x.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
	},
	{
		label: 'WhatsApp',
		icon: FaWhatsapp,
		href: (url: string, title: string) =>
			`https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' ' + url)}`,
	},
	{
		label: 'LinkedIn',
		icon: FaLinkedinIn,
		href: (url: string) =>
			`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
	},
	{
		label: 'Telegram',
		icon: FaTelegram,
		href: (url: string, title: string) =>
			`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
	},
	{
		label: 'Reddit',
		icon: FaRedditAlien,
		href: (url: string, title: string) =>
			`https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
	},
] as const

const btnClass =
	'grid size-11 place-items-center rounded border border-line bg-surface text-ink transition hover:bg-ink hover:text-canvas'

export default function ShareBarFooter({ title }: { title?: string }) {
	const url = typeof window !== 'undefined' ? window.location.href : ''
	const t = title || ''

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
						<Icon className="size-5" />
					</a>
				))}
				<ClickToCopy
					value={url}
					className={btnClass}
					aria-label="Copia link"
				>
					<IoIosLink className="size-5" />
				</ClickToCopy>
			</div>
		</div>
	)
}
