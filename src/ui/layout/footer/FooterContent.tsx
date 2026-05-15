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
			<div className="bg-brand py-14 sm:py-20">
				<div className="mx-auto flex max-w-screen-2xl flex-col items-center gap-8 px-4 text-center">
					{/* Logo grande */}
					<Link href="/">
						{logoUrl ? (
							<Image
								src={logoUrl}
								alt={siteTitle || 'Logo'}
								width={400}
								height={100}
								className="h-16 w-auto sm:h-24"
							/>
						) : (
							<span className="text-4xl font-extrabold italic tracking-tight text-brand-foreground sm:text-6xl">
								<span>TM</span>
								<span className="font-light">SPORT</span>
							</span>
						)}
					</Link>

					{/* Blurb */}
					{blurb && (
						<div className="max-w-2xl text-sm leading-relaxed text-brand-foreground/80 sm:text-base">
							<PortableText value={blurb} />
						</div>
					)}

					{/* Social icons */}
					{socialLinks && socialLinks.length > 0 && (
						<div className="flex flex-wrap items-center justify-center gap-3">
							{socialLinks.map((link, i) => (
								<CTA
									key={i}
									link={link}
									className="grid size-10 place-items-center rounded-lg border border-brand-foreground/20 text-brand-foreground transition hover:bg-brand-foreground/10"
								>
									<SocialIcon
										url={link.external}
										className="!size-4"
										aria-label={link.label}
									/>
								</CTA>
							))}
						</div>
					)}

					{/* Copyright */}
					{copyright && (
						<div className="text-xs text-brand-foreground/60">
							<PortableText value={copyright} />
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
