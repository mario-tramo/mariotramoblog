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
	const columnCount = (footerLinks?.length ?? 0) + 1 + (showNewsletter ? 1 : 0)

	return (
		<footer className="mt-20 bg-surface">
			<div
				className="mx-auto grid max-w-[1400px] grid-cols-2 gap-8 px-3 py-12 text-sm sm:grid-cols-3 sm:gap-10 sm:px-6 sm:py-14 lg:grid-cols-[repeat(var(--footer-cols),minmax(0,1fr))]"
				style={{ '--footer-cols': columnCount } as React.CSSProperties}
			>
				{/* Brand Section */}
				<div className="col-span-2 sm:col-span-3 lg:col-span-1">
					<Link href="/" className="mb-3 flex items-baseline gap-0.5">
						{logoUrl ? (
							<Image
								src={logoUrl}
								alt={siteTitle || 'Logo'}
								width={140}
								height={40}
								className="h-8 w-auto"
							/>
						) : (
							<>
								<span className="text-xl font-extrabold italic text-brand">
									TM
								</span>
								<span className="text-xl font-light italic tracking-tight text-ink">
									SPORT
								</span>
							</>
						)}
					</Link>

					{blurb && (
						<div className="mb-4 text-xs leading-relaxed text-muted">
							<PortableText value={blurb} />
						</div>
					)}

					{socialLinks && socialLinks.length > 0 && (
						<div className="mb-4 flex flex-wrap items-center gap-2">
							{socialLinks.map((link, i) => (
								<CTA
									key={i}
									link={link}
									className="grid size-8 place-items-center rounded-full bg-surface-light text-muted transition hover:text-ink"
								>
									<SocialIcon
										url={link.external}
										aria-label={link.label}
									/>
								</CTA>
							))}
						</div>
					)}

					{copyright && (
						<div className="text-[11px] text-muted">
							<PortableText value={copyright} />
						</div>
					)}
				</div>

				{/* Dynamic Link Columns from Sanity */}
				{footerLinks?.map((group, i) => (
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

				{/* Newsletter Section */}
				{showNewsletter && (
					<div className="col-span-2 sm:col-span-3 lg:col-span-1">
						<NewsletterSubscribe variant="inline" />
					</div>
				)}
			</div>
		</footer>
	)
}
