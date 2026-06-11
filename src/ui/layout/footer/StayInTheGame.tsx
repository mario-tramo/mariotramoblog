import Link from 'next/link'
import Image from 'next/image'
import CTA from '@/ui/primitives/CTA'
import { PortableText } from 'next-sanity'
import {
	FaFacebookF,
	FaInstagram,
	FaXTwitter,
	FaYoutube,
	FaTiktok,
} from 'react-icons/fa6'
import { IoIosLink } from 'react-icons/io'
import type { IconType } from 'react-icons'
import type { PortableTextBlock } from '@portabletext/react'

interface StayInTheGameProps {
	blurb?: PortableTextBlock[]
	socialLinks?: Sanity.Link[]
	logoUrl?: string
	siteTitle?: string
}

// Single source of truth for supported social platforms.
// To add a platform: append one entry. To disable one: remove its entry
// (links pointing to it then fall back to the generic link icon).
const SOCIAL_PLATFORMS: { test: RegExp; icon: IconType; label: string }[] = [
	{ test: /(?:x\.com|twitter\.com)/, icon: FaXTwitter, label: 'X' },
	{ test: /instagram\.com/, icon: FaInstagram, label: 'Instagram' },
	{ test: /facebook\.com|fb\.com/, icon: FaFacebookF, label: 'Facebook' },
	{ test: /youtube\.com|youtu\.be/, icon: FaYoutube, label: 'YouTube' },
	{ test: /tiktok\.com/, icon: FaTiktok, label: 'TikTok' },
]

function SocialIcon({ url, ...props }: { url?: string } & React.ComponentProps<'svg'>) {
	if (!url) return null

	const Icon = SOCIAL_PLATFORMS.find(({ test }) => test.test(url))?.icon ?? IoIosLink
	return <Icon className="size-3.5" {...props} />
}

export default function StayInTheGame({
	blurb,
	socialLinks,
	logoUrl,
	siteTitle,
}: StayInTheGameProps) {
	return (
		<section
			className="relative overflow-hidden px-6 pt-20 pb-12 sm:px-8 sm:pt-24 sm:pb-16"
			style={{
				background: `linear-gradient(180deg, var(--color-banner) 0%, var(--color-banner-deep) 100%)`,
			}}
		>
			{/* Top accent line */}
			<div
				className="absolute inset-x-0 top-0 h-px"
				style={{
					background: `linear-gradient(90deg, transparent 0%, var(--color-brand) 50%, transparent 100%)`,
					opacity: 0.4,
				}}
			/>

			{/* Radial glow */}
			<div
				className="pointer-events-none absolute inset-0"
				style={{
					background: `radial-gradient(ellipse 60% 50% at 50% 30%, var(--color-brand-glow), transparent 70%)`,
				}}
			/>

			<div className="relative mx-auto flex max-w-screen-2xl flex-col items-center text-center">
				{/* Logo */}
				<Link href="/" className="mb-8">
					{logoUrl ? (
						<Image
							src={logoUrl}
							alt={siteTitle || 'Logo'}
							width={400}
							height={100}
							className="h-10 w-auto sm:h-14"
						/>
					) : (
						<span className="text-xl font-black uppercase italic tracking-tighter text-ink">
							TRM<span className="text-brand">Sport</span>
						</span>
					)}
				</Link>

				{/* Heading */}
				<h2 className="mb-6 text-4xl font-black uppercase leading-[0.9] tracking-wide text-ink sm:text-5xl md:text-6xl">
					Stay in the{' '}
					<span
						className="italic text-brand"
						style={{
							textShadow: '0 0 40px var(--color-brand-glow), 0 0 80px var(--color-brand-glow)',
						}}
					>
						game
					</span>
				</h2>

				{/* Blurb */}
				{blurb && (
					<div className="mb-10 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
						<PortableText value={blurb} />
					</div>
				)}

				{/* Social icons */}
				{socialLinks && socialLinks.length > 0 && (
					<div className="flex items-center gap-4 sm:gap-5">
						{socialLinks.map((link, i) => (
							<CTA
								key={i}
								link={link}
								className="group grid size-10 place-items-center rounded-full border border-line text-muted transition-all duration-300 hover:border-brand/30 hover:text-brand hover:shadow-[0_0_12px_var(--color-brand-glow)]"
							>
								<SocialIcon
									url={link.external}
									className="!size-4 transition-transform duration-300 group-hover:scale-110"
									aria-label={link.label}
								/>
							</CTA>
						))}
					</div>
				)}
			</div>
		</section>
	)
}
