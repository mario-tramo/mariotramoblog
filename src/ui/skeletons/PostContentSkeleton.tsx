export default function PostContentSkeleton() {
	return (
		<article>
			{/* Breadcrumb */}
			<nav className="mx-auto max-w-screen-2xl px-4 pt-4 sm:px-6">
				<div className="flex items-center gap-1">
					<div className="skeleton h-4 w-10" />
					<span className="text-xs text-muted">&gt;</span>
					<div className="skeleton h-4 w-10" />
					<span className="text-xs text-muted">&gt;</span>
					<div className="skeleton h-4 w-32" />
				</div>
			</nav>

			{/* 2-column layout */}
			<div className="mx-auto grid max-w-screen-2xl gap-10 px-4 pt-8 sm:px-6 lg:grid-cols-[1fr_320px]">
				{/* Main content */}
				<div className="min-w-0">
					{/* Header */}
					<header className="space-y-5">
						<div className="skeleton h-6 w-24 rounded-full" />
						<div className="skeleton-3 max-w-2xl" />
						<div className="skeleton-2 max-w-xl" />

						{/* Author bar */}
						<div className="flex items-center gap-3 border-y border-ink/5 py-4">
							<div className="size-9 rounded-full bg-ink/3" />
							<div className="space-y-1">
								<div className="skeleton h-4 w-28" />
								<div className="skeleton h-3 w-36" />
							</div>
						</div>
					</header>

					{/* Hero image */}
					<div className="mt-8 aspect-video rounded-xl bg-ink/3" />

					{/* Body */}
					<div className="mt-10 space-y-4">
						{['w-3/4', 'w-[90%]', 'w-4/5', 'w-[95%]', 'w-[70%]', 'w-[85%]', 'w-[78%]', 'w-[92%]'].map((w, i) => (
							<div key={i} className={`skeleton ${w}`} />
						))}
						<div className="skeleton-2 w-[85%]" />
						{['w-[65%]', 'w-[88%]', 'w-[72%]', 'w-[95%]', 'w-4/5', 'w-[68%]'].map((w, i) => (
							<div key={`b${i}`} className={`skeleton ${w}`} />
						))}
					</div>
				</div>

				{/* Sidebar */}
				<aside className="space-y-6 max-lg:order-last">
					<RelatedPostsSkeleton />
					<div className="rounded-2xl bg-surface p-4">
						<div className="skeleton mb-3 w-40" />
						<div className="skeleton-2 mb-3" />
						<div className="h-10 rounded-lg bg-ink/3" />
					</div>
				</aside>
			</div>
		</article>
	)
}

export function RelatedPostsSkeleton({ variant = 'sidebar' }: { variant?: 'sidebar' | 'full' }) {
	if (variant === 'full') {
		return (
			<section className="mx-auto mt-16 max-w-[820px] px-4 pb-12 sm:px-6">
				<div className="skeleton mb-6 w-40" />
				<div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
					{Array.from({ length: 3 }).map((_, i) => (
						<div
							key={i}
							className="overflow-hidden rounded-xl bg-surface"
						>
							<div className="aspect-[16/10] bg-ink/3" />
							<div className="space-y-2 p-4">
								<div className="skeleton-2" />
								<div className="skeleton h-3 w-16" />
							</div>
						</div>
					))}
				</div>
			</section>
		)
	}

	return (
		<div className="rounded-2xl bg-surface p-5 sm:p-6">
			<div className="skeleton mb-5 w-32" />
			<ul className="space-y-5">
				{Array.from({ length: 4 }).map((_, i) => (
					<li key={i} className="flex gap-3">
						<div className="size-14 flex-shrink-0 rounded-lg bg-ink/3" />
						<div className="flex-1 space-y-1">
							<div className="skeleton-2" />
							<div className="skeleton h-3 w-16" />
						</div>
					</li>
				))}
			</ul>
		</div>
	)
}
