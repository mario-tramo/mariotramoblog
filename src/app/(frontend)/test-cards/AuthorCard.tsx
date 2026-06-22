'use client'

import { useId } from 'react'

interface AuthorCardProps {
	name: string
	imageUrl?: string
	initials: string
	articleCount: number
	bio: string
	socialLinks?: { platform: 'linkedin' | 'x'; url: string }[]
}

export default function AuthorCard({
	name,
	imageUrl,
	initials,
	articleCount,
	bio,
	socialLinks,
}: AuthorCardProps) {
	const uid = useId()
	const gradientId = `author-bg-${uid}`

	return (
		<article className="flex flex-col items-center gap-4 rounded-2xl border border-line-soft bg-surface p-8 text-center sm:flex-row sm:text-left">
			{/* Avatar */}
			<div className="relative shrink-0">
				<svg width="100" height="100" viewBox="0 0 100 100" className="absolute -inset-2.5 size-[125px]">
					<defs>
						<linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
							<stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.15" />
							<stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0.05" />
						</linearGradient>
					</defs>
					<circle cx="50" cy="50" r="50" fill={`url(#${gradientId})`} />
				</svg>
				<div className="relative flex size-[85px] items-center justify-center overflow-hidden rounded-full bg-accent/10">
					{imageUrl ? (
						<img
							src={imageUrl}
							alt={name}
							className="size-full object-cover"
						/>
					) : (
						<span className="text-2xl font-bold text-accent">
							{initials}
						</span>
					)}
				</div>
			</div>

			{/* Content */}
			<div className="flex flex-col items-center gap-3 sm:items-start">
				<div>
					<p className="text-[11px] font-bold uppercase tracking-widest text-muted">
						Scritto da
					</p>
					<h3 className="text-xl font-bold text-white">{name}</h3>
				</div>

				<div className="inline-flex items-center gap-1.5 rounded-full bg-accent/8 px-3 py-1 text-xs text-muted">
					<span className="font-semibold text-accent">{articleCount.toLocaleString()}</span>
					<span>Articoli</span>
				</div>

				{socialLinks && socialLinks.length > 0 && (
					<div className="flex gap-3">
						{socialLinks.map((link) => (
							<a
								key={link.platform}
								href={link.url}
								target="_blank"
								rel="noopener noreferrer"
								className="flex size-8 items-center justify-center rounded-lg border border-line-soft text-white/50 transition-colors hover:border-accent/40 hover:text-accent"
							>
								{link.platform === 'linkedin' ? (
									<svg width="16" height="16" viewBox="0 0 28 28" fill="none">
										<rect x="0.74" y="0.74" width="25.72" height="25.72" fill="none" stroke="currentColor" strokeWidth="1.47" />
										<path fillRule="evenodd" clipRule="evenodd" d="M20.064 20.052H17.408V15.527c0-1.24-.472-1.934-1.454-1.934-1.068 0-1.626.722-1.626 1.934v4.525h-2.56V11.432h2.56v1.161s.77-1.424 2.599-1.424c1.828 0 3.137 1.117 3.137 3.426v5.457ZM8.714 10.304a1.59 1.59 0 0 1-1.58-1.59 1.59 1.59 0 0 1 1.58-1.591 1.59 1.59 0 0 1 1.578 1.59 1.59 1.59 0 0 1-1.579 1.59ZM7.392 20.052h2.67V11.432h-2.67v8.62Z" fill="currentColor" />
									</svg>
								) : (
									<svg width="16" height="16" viewBox="0 0 29 29" fill="none">
										<rect x="0.62" y="0.62" width="27.45" height="27.45" fill="none" stroke="currentColor" strokeWidth="1.25" />
										<path d="M18.196 8.42l-3.42 3.91-2.957-3.91H7.535l5.118 6.692-4.85 5.544h2.076l3.744-4.278 3.272 4.278h4.177l-5.335-7.053 4.535-5.183h-2.076Zm-.728 10.993l-7.509-9.817h1.235l7.424 9.816h-1.15Z" fill="currentColor" />
									</svg>
								)}
							</a>
						))}
					</div>
				)}

				{bio && (
					<p className="max-w-prose text-sm leading-relaxed text-muted line-clamp-3">
						{bio}
					</p>
				)}

				<a
					href="#"
					className="inline-flex items-center gap-2 text-xs font-medium text-accent transition-colors hover:text-white"
				>
					Know more
					<svg width="8" height="8" viewBox="0 0 8 8" fill="none" className="fill-current">
						<path
							fillRule="evenodd"
							clipRule="evenodd"
							d="M0.181609 7.19725C0.0653116 7.08095 -2.37364e-05 6.92322 -2.38981e-05 6.75875C-2.38911e-05 6.59428 0.0653118 6.43654 0.181609 6.32025L5.26238 1.23948L1.49711 1.23948C1.33653 1.23381 1.18442 1.16603 1.07282 1.05043C0.961223 0.934822 0.898855 0.780413 0.898855 0.619731C0.898855 0.459049 0.961224 0.30464 1.07282 0.189034C1.18442 0.0734281 1.33653 0.00565133 1.49711 -1.68616e-05L6.75913 -1.65656e-05C6.92346 8.57703e-05 7.08104 0.0654133 7.19724 0.181617C7.31344 0.29782 7.37877 0.455396 7.37887 0.619732L7.37887 5.88174C7.37321 6.04233 7.30543 6.19444 7.18982 6.30604C7.07422 6.41763 6.91981 6.48 6.75913 6.48C6.59844 6.48 6.44403 6.41763 6.32843 6.30604C6.21282 6.19444 6.14505 6.04233 6.13938 5.88174L6.13938 2.11648L1.05861 7.19725C0.942314 7.31355 0.78458 7.37888 0.62011 7.37888C0.45564 7.37888 0.297907 7.31355 0.181609 7.19725Z"
						/>
					</svg>
				</a>
			</div>
		</article>
	)
}
