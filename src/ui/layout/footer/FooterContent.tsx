import Link from 'next/link'
import Image from 'next/image'
import CTA from '@/ui/primitives/CTA'
import NewsletterSubscribe from '@/ui/features/newsletter'
import { PortableText, stegaClean } from 'next-sanity'
import {
	FaFacebookF,
	FaInstagram,
	FaXTwitter,
	FaYoutube,
	FaTiktok,
} from 'react-icons/fa6'
import { IoIosLink } from 'react-icons/io'
import type { PortableTextBlock } from '@portabletext/react'

interface FooterContentProps {
	blurb?: PortableTextBlock[]
	copyright?: PortableTextBlock[]
	footerLinks?: Sanity.LinkList[]
	socialLinks?: Sanity.Link[]
	showNewsletter?: boolean
	logoUrl?: string
	siteTitle?: string
}

function SocialIcon({ url, ...props }: { url?: string } & React.ComponentProps<'svg'>) {
	if (!url) return null

	if (url.includes('x.com') || url.includes('twitter.com'))
		return <FaXTwitter className="size-3.5" {...props} />
	if (url.includes('instagram.com'))
		return <FaInstagram className="size-3.5" {...props} />
	if (url.includes('youtube.com'))
		return <FaYoutube className="size-3.5" {...props} />
	if (url.includes('tiktok.com'))
		return <FaTiktok className="size-3.5" {...props} />
	if (url.includes('facebook.com'))
		return <FaFacebookF className="size-3.5" {...props} />

	return <IoIosLink className="size-3.5" {...props} />
}

export default function FooterContent({
	blurb,
	copyright,
	footerLinks,
	socialLinks,
	showNewsletter = true,
	logoUrl,
	siteTitle,
}: FooterContentProps) {
	return (
		<footer className="mt-12">
			{/* Banner */}
			<div
				className="relative overflow-hidden px-6 pt-20 pb-0 sm:px-8 sm:pt-24"
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
					<h2 className="mb-6 text-4xl font-black uppercase leading-[0.9] tracking-tighter text-ink sm:text-5xl md:text-6xl">
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
									className="group grid size-10 place-items-center rounded-full border border-ink/10 text-muted transition-all duration-300 hover:border-brand/30 hover:text-brand hover:shadow-[0_0_12px_var(--color-brand-glow)]"
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

					{/* Copyright */}
					{copyright && (
						<div
							className="mt-8 w-full pt-5"
							style={{
								borderTop: '1px solid color-mix(in oklab, var(--color-brand) 10%, transparent)',
							}}
						>
							<div className="text-[10px] uppercase tracking-widest text-muted/60">
								<PortableText value={copyright} />
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Footer links */}
			{footerLinks && footerLinks.length > 0 && (
				<div className="bg-surface">
					<div className="mx-auto grid max-w-screen-2xl grid-cols-2 gap-8 px-3 py-10 text-sm sm:grid-cols-3 sm:gap-10 sm:px-6 lg:grid-cols-4">
						{footerLinks.map((group, i) => (
							<div key={i}>
								{group.link && (
									<h4 className="mb-3 text-[11px] font-bold uppercase tracking-widest text-ink">
										{stegaClean(group.link.label) ||
											group.link.internal?.title}
									</h4>
								)}
								<ul className="space-y-3 text-xs text-muted">
									{group.links?.map((link, j) => (
										<li key={j}>
											<CTA
												link={link}
												className="transition hover:text-ink"
											/>
										</li>
									))}
								</ul>
							</div>
						))}

						{showNewsletter && (
							<div className="col-span-2 sm:col-span-3 lg:col-span-1">
								<NewsletterSubscribe variant="inline" />
							</div>
						)}
					</div>
				</div>
			)}
		</footer>
	)
}
