'use client'

import { motion } from 'framer-motion'
import CTA from '@/ui/primitives/CTA'
import NewsletterSubscribe from '@/ui/features/newsletter'
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
	return (
		<motion.footer
			initial={{ opacity: 0, y: 16 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.45, ease: 'easeOut' }}
		>
			{/* Footer links */}
			{footerLinks && footerLinks.length > 0 && (
				<div className="bg-surface">
					<div className="mx-auto grid max-w-screen-2xl grid-cols-2 gap-8 px-3 py-10 text-sm sm:grid-cols-3 sm:gap-10 sm:px-6 lg:grid-cols-4">
						{footerLinks.map((group, i) => (
							<motion.div
								key={i}
								initial={{ opacity: 0, y: 12 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: i * 0.05, duration: 0.35, ease: 'easeOut' }}
							>
								{group.link && (
									<h4 className="mb-3 text-[11px] font-bold uppercase tracking-widest text-ink">
										{stegaClean(group.link.label) ||
											group.link.internal?.title}
									</h4>
								)}
								<ul className="space-y-3 text-xs text-muted">
									{group.links?.map((link, j) => (
										<motion.li
											key={j}
											whileHover={{ x: 2 }}
											transition={{ duration: 0.15 }}
										>
											<CTA
												link={link}
												className="transition hover:text-ink"
											/>
										</motion.li>
									))}
								</ul>
							</motion.div>
						))}

						{showNewsletter && (
							<motion.div
								className="col-span-2 sm:col-span-3 lg:col-span-1 premium-glow"
								initial={{ opacity: 0, y: 12 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.2, duration: 0.4, ease: 'easeOut' }}
							>
								<NewsletterSubscribe variant="inline" />
							</motion.div>
						)}
					</div>
				</div>
			)}

			{/* Copyright */}
			{copyright && (
				<div className="bg-surface">
					<motion.div
						className="mx-auto max-w-screen-2xl px-3 pb-8 sm:px-6"
						style={{
							borderTop: '1px solid color-mix(in oklab, var(--color-brand) 10%, transparent)',
						}}
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.35, ease: 'easeOut' }}
					>
						<div className="pt-5 text-center text-[10px] uppercase tracking-widest text-muted/60">
							<PortableText value={copyright} />
						</div>
					</motion.div>
				</div>
			)}
		</motion.footer>
	)
}
