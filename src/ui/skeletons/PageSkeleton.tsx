export default function PageSkeleton() {
	return (
		<div className="section space-y-8 py-12">
			{/* Hero-like area */}
			<div className="mx-auto max-w-screen-md space-y-4 text-center">
				<div className="skeleton-3 mx-auto max-w-lg" />
				<div className="skeleton mx-auto max-w-sm" />
			</div>

			{/* Content blocks */}
			<div className="mx-auto max-w-screen-md space-y-4">
				{['w-3/4', 'w-[90%]', 'w-4/5', 'w-[95%]', 'w-[70%]', 'w-[85%]'].map((w, i) => (
					<div key={i} className={`skeleton ${w}`} />
				))}
			</div>

			{/* Card grid placeholder */}
			<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{Array.from({ length: 3 }).map((_, i) => (
					<div
						key={i}
						className="rounded-2xl border border-border bg-surface p-4"
					>
						<div className="aspect-video rounded-lg bg-ink/3" />
						<div className="mt-3 space-y-2">
							<div className="skeleton" />
							<div className="skeleton-2" />
						</div>
					</div>
				))}
			</div>
		</div>
	)
}
