import Link from 'next/link'
import CTA from '@/ui/CTA'
import { PortableText, stegaClean } from 'next-sanity'
import {
	FaFacebookF,
	FaInstagram,
	FaXTwitter,
	FaYoutube,
	FaTiktok,
} from 'react-icons/fa6'
import { IoIosLink } from 'react-icons/io'

interface FooterContentProps {
	blurb?: any
	copyright?: any
	footerLinks?: Sanity.LinkList[]
	socialLinks?: Sanity.Link[]
	showNewsletter?: boolean
}

function SocialIcon({ url, ...props }: { url?: string } & React.ComponentProps<'svg'>) {
	if (!url) return null

	if (url.includes('x.com') || url.includes('twitter.com'))
		return <FaXTwitter className="w-5 h-5" {...props} />
	if (url.includes('instagram.com'))
		return <FaInstagram className="w-5 h-5" {...props} />
	if (url.includes('youtube.com'))
		return <FaYoutube className="w-5 h-5" {...props} />
	if (url.includes('tiktok.com'))
		return <FaTiktok className="w-5 h-5" {...props} />
	if (url.includes('facebook.com'))
		return <FaFacebookF className="w-5 h-5" {...props} />

	return <IoIosLink className="w-5 h-5" {...props} />
}

export default function FooterContent({
	blurb,
	copyright,
	footerLinks,
	socialLinks,
	showNewsletter = true,
}: FooterContentProps) {
	const columnCount = (footerLinks?.length ?? 0) + 1 + (showNewsletter ? 1 : 0)

	return (
		<footer className="bg-[#0d1117] border-t border-[#21262d]">
			<div className="max-w-[1400px] mx-auto px-4 md:px-6 py-10">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[repeat(var(--footer-cols),minmax(0,1fr))] gap-8" style={{ '--footer-cols': columnCount } as React.CSSProperties}>
					{/* Brand Section */}
					<div className="lg:col-span-1">
						<Link href="/" className="flex items-baseline gap-0.5 mb-3">
							<span className="text-[#4fc3dc] text-xl font-bold italic">TM</span>
							<span className="text-white text-xl font-light italic tracking-tight">
								SPORT
							</span>
						</Link>

						{blurb && (
							<div className="text-[#8b949e] text-sm leading-relaxed mb-4">
								<PortableText value={blurb} />
							</div>
						)}

						{/* Social Icons */}
						{socialLinks && socialLinks.length > 0 && (
							<div className="flex items-center gap-3 mb-4">
								{socialLinks.map((link, i) => (
									<CTA
										key={i}
										link={link}
										className="text-[#c9d1d9] hover:text-white transition-colors"
									>
										<SocialIcon url={link.external} aria-label={link.label} />
									</CTA>
								))}
							</div>
						)}

						{copyright && (
							<div className="text-[#8b949e] text-xs">
								<PortableText value={copyright} />
							</div>
						)}
					</div>

					{/* Dynamic Link Columns from Sanity */}
					{footerLinks?.map((group, i) => (
						<div key={i}>
							{group.link && (
								<h3 className="text-[#8b949e] text-xs font-semibold uppercase tracking-wider mb-4">
									{stegaClean(group.link.label) ||
										group.link.internal?.title}
								</h3>
							)}
							<ul className="space-y-2">
								{group.links?.map((link, j) => (
									<li key={j}>
										<CTA
											link={link}
											className="text-[#c9d1d9] text-sm hover:text-white transition-colors"
										/>
									</li>
								))}
							</ul>
						</div>
					))}

					{/* Newsletter Section */}
					{showNewsletter && (
						<div>
							<h3 className="text-[#8b949e] text-xs font-semibold uppercase tracking-wider mb-4">
								Stay Updated
							</h3>
							<p className="text-[#8b949e] text-sm mb-4">
								Subscribe to our newsletter
								<br />
								for daily football stories.
							</p>
							<div className="flex">
								<input
									type="email"
									placeholder="Enter your email"
									className="flex-1 min-w-0 bg-[#161b22] border border-[#30363d] rounded-l-md px-3 py-2 text-sm text-white placeholder-[#8b949e] focus:outline-none focus:border-[#4fc3dc]"
								/>
								<button className="bg-[#4fc3dc] hover:bg-[#3fb3cc] text-[#0d1117] font-medium text-sm px-4 py-2 rounded-r-md transition-colors whitespace-nowrap">
									Subscribe
								</button>
							</div>
						</div>
					)}
				</div>
			</div>
		</footer>
	)
}
