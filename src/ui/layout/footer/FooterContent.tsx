'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import CTA from '@/ui/primitives/CTA'
import NewsletterSubscribe from '@/ui/features/newsletter'
import { useCookieConsent } from '@/ui/features/CookieConsent'
import { PortableText } from '@portabletext/react'
import { stegaClean } from '@sanity/client/stega'
import { getSocialIcon } from '@/ui/primitives/SocialIcons'
import type { PortableTextBlock } from '@portabletext/react'

interface FooterContentProps {
	copyright?: PortableTextBlock[]
	footerLinks?: Sanity.LinkList[]
	showNewsletter?: boolean
	logoUrl?: string
	siteTitle?: string
	socialLinks?: Sanity.Link[]
}

function SocialIcon({ url, ...props }: { url?: string } & React.SVGProps<SVGSVGElement>) {
	if (!url) return null
	const Icon = getSocialIcon(url)
	return <Icon className="size-4" {...props} />
}

export default function FooterContent({
	copyright,
	footerLinks,
	showNewsletter = true,
	logoUrl,
	siteTitle,
	socialLinks,
}: FooterContentProps) {
	const { requestReconsideration } = useCookieConsent()
	const [openSection, setOpenSection] = useState<number | null>(null)

	return (
		<footer>
			{/* Footer links */}
			{footerLinks && footerLinks.length > 0 && (
				<div className="bg-surface">
					{/* Mobile: accordion + logo/social below */}
					<div className="sm:hidden">
						{footerLinks.map((group, i) => (
							<div key={i} className="border-b border-line">
								<button
									type="button"
									onClick={() => setOpenSection(openSection === i ? null : i)}
									aria-expanded={openSection === i}
									className="flex w-full items-center justify-between px-4 py-4 text-xs font-bold uppercase tracking-widest text-ink"
								>
									{group.link?.label || group.link?.internal?.title}
									<ChevronDown
										size={14}
										className={`shrink-0 transition-transform ${openSection === i ? 'rotate-180' : ''}`}
									/>
								</button>
								{openSection === i && (
									<ul className="space-y-3 px-4 pb-5 text-sm text-muted">
										{group.links?.map((link, j) => (
											<li key={j}>
												<CTA link={link} className="transition hover:text-ink" />
											</li>
										))}
									</ul>
								)}
							</div>
						))}

						{/* Logo + Social on mobile */}
						<div className="flex flex-col items-center gap-5 px-4 py-10">
							{socialLinks && socialLinks.length > 0 && (
								<div className="flex items-center gap-4">
									{socialLinks.map((link, i) => (
										<CTA
											key={i}
											link={link}
											aria-label={link.label}
											className="grid size-10 place-items-center rounded-full border border-line text-muted transition hover:border-brand/30 hover:text-brand"
										>
											<SocialIcon url={link.external} />
										</CTA>
									))}
								</div>
							)}
							<Link href="/">
								{logoUrl ? (
									<Image
										src={logoUrl}
										alt={siteTitle || 'TRM Sport'}
										width={280}
										height={70}
										className="h-14 w-auto"
									/>
								) : (
									<span className="text-2xl font-black uppercase italic tracking-tighter text-ink">
										TRM<span className="text-brand">Sport</span>
									</span>
								)}
							</Link>
						</div>
					</div>

					{/* Desktop: row layout */}
					<div className="mx-auto hidden max-w-screen-2xl flex-row gap-10 px-6 py-16 sm:flex">
						<div className="flex shrink-0 items-start">
							<Link href="/">
								{logoUrl ? (
									<Image
										src={logoUrl}
										alt={siteTitle || 'TRM Sport'}
										width={280}
										height={70}
										className="h-[140px] w-auto"
									/>
								) : (
									<span className="text-2xl font-black uppercase italic tracking-tighter text-ink sm:text-3xl">
										TRM<span className="text-brand">Sport</span>
									</span>
								)}
							</Link>
						</div>
						<div className="grid flex-1 grid-cols-3 gap-10">
							{footerLinks.map((group, i) => (
								<div key={i}>
									{group.link && (
										<h4 className="mb-4 text-[11px] font-bold uppercase tracking-widest text-ink">
											{stegaClean(group.link.label) || group.link.internal?.title}
										</h4>
									)}
									<ul className="space-y-3 text-xs text-muted">
										{group.links?.map((link, j) => (
											<li key={j}>
												<CTA link={link} className="transition hover:text-ink" />
											</li>
										))}
									</ul>
								</div>
							))}
							{showNewsletter && <NewsletterSubscribe variant="inline" />}
						</div>
					</div>
				</div>
			)}

			{/* Copyright */}
			{copyright && (
				<div className="bg-surface">
					<div className="mx-auto max-w-screen-2xl border-t border-line px-4 pb-8 sm:px-6">
					<div className="pt-5 text-center text-[10px] uppercase tracking-widest text-muted">
						<PortableText value={copyright} />
					</div>
					<div className="mt-2 flex items-center justify-center gap-3 text-[10px] uppercase tracking-widest">
						<Link
							href="/legal/cookie-policy"
							className="text-muted transition hover:text-ink"
						>
							Cookie Policy
						</Link>
						<span className="text-muted/40">·</span>
						<Link
							href="/legal/privacy-policy"
							className="text-muted transition hover:text-ink"
						>
							Privacy Policy
						</Link>
						<span className="text-muted/40">·</span>
						<button
							type="button"
							onClick={requestReconsideration}
							className="text-muted transition hover:text-ink"
						>
							Preferenze cookie
						</button>
					</div>
					</div>
				</div>
			)}
		</footer>
	)
}
