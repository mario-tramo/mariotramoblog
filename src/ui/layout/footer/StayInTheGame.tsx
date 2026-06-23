import CTA from '@/ui/primitives/CTA'
import { PortableText } from '@portabletext/react'
import { getSocialIcon } from '@/ui/primitives/SocialIcons'
import type { PortableTextBlock } from '@portabletext/react'

interface StayInTheGameProps {
	blurb?: PortableTextBlock[]
	socialLinks?: Sanity.Link[]
}

function SocialIcon({ url, ...props }: { url?: string } & React.SVGProps<SVGSVGElement>) {
	if (!url) return null
	const Icon = getSocialIcon(url)
	return <Icon className="size-3.5" {...props} />
}

export default function StayInTheGame({
	blurb,
	socialLinks,
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
								aria-label={link.label}
								className="group grid size-10 place-items-center rounded-full border border-line text-muted transition-all duration-300 hover:border-brand/30 hover:text-brand hover:shadow-[0_0_12px_var(--color-brand-glow)]"
							>
								<SocialIcon
									url={link.external}
									className="!size-4 transition-transform duration-300 group-hover:scale-110"
								/>
							</CTA>
						))}
					</div>
				)}
			</div>
		</section>
	)
}
