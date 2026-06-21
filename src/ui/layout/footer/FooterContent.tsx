'use client'

import Link from 'next/link'
import CTA from '@/ui/primitives/CTA'
import NewsletterSubscribe from '@/ui/features/newsletter'
import { useCookieConsent } from '@/ui/features/CookieConsent'
import { PortableText, stegaClean } from 'next-sanity'
import type { PortableTextBlock } from '@portabletext/react'

interface FooterContentProps {
	copyright?: PortableTextBlock[]
	footerLinks?: Sanity.LinkList[]
	showNewsletter?: boolean
}

export default function FooterContent({
	copyright,
	footerLinks,
	showNewsletter = true,
}: FooterContentProps) {
	const { requestReconsideration } = useCookieConsent()

	return (
		<footer>
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

			{/* Copyright */}
			{copyright && (
				<div className="bg-surface">
					<div
						className="mx-auto max-w-screen-2xl border-t border-line px-3 pb-8 sm:px-6"
					>
						<div className="pt-5 text-center text-[10px] uppercase tracking-widest text-muted/60">
							<PortableText value={copyright} />
						</div>
						<div className="mt-2 flex items-center justify-center gap-3 text-[10px] uppercase tracking-widest">
							<Link
								href="/legal/cookie-policy"
								className="text-muted/40 transition hover:text-muted/60"
							>
								Cookie Policy
							</Link>
							<span className="text-muted/20">·</span>
							<Link
								href="/legal/privacy-policy"
								className="text-muted/40 transition hover:text-muted/60"
							>
								Privacy Policy
							</Link>
							<span className="text-muted/20">·</span>
							<button
								onClick={requestReconsideration}
								className="text-muted/40 transition hover:text-muted/60"
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
