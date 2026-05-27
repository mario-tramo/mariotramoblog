export default function BlogFrontpageSkeleton() {
	return (
		<section className="section space-y-8">
			{/* 3-column newspaper layout */}
			<div className="grid grid-cols-12 gap-6 sm:gap-8">
				{/* LEFT SIDEBAR */}
				<aside className="order-2 col-span-12 space-y-5 sm:space-y-6 lg:order-1 lg:col-span-3">
					<WidgetSkeleton rows={5} />
				</aside>

				{/* CENTER CONTENT */}
				<div className="order-1 col-span-12 space-y-5 sm:space-y-6 lg:order-2 lg:col-span-6">
					<WidgetSkeleton rows={4} grid />
					<WidgetSkeleton rows={4} />
				</div>

				{/* RIGHT SIDEBAR */}
				<aside className="order-3 col-span-12 space-y-5 sm:space-y-6 lg:col-span-3">
					<WidgetSkeleton rows={5} />
					<div className="rounded-2xl bg-surface p-4">
						<div className="skeleton mb-3 w-32" />
						<div className="aspect-[4/3] rounded-lg bg-ink/3" />
						<div className="skeleton-2 mt-3" />
					</div>
				</aside>
			</div>

			<hr />

			{/* Filter bar skeleton */}
			<div className="flex flex-wrap gap-2 max-sm:justify-center">
				{Array.from({ length: 6 }).map((_, i) => (
					<div
						key={i}
						className="h-8 w-20 rounded-full bg-ink/3"
					/>
				))}
			</div>

			{/* Post grid skeleton */}
			<div className="grid gap-x-8 gap-y-12 sm:grid-cols-[repeat(auto-fill,minmax(300px,1fr))]">
				{Array.from({ length: 6 }).map((_, i) => (
					<PostPreviewSkeleton key={i} />
				))}
			</div>
		</section>
	)
}

function WidgetSkeleton({ rows, grid }: { rows: number; grid?: boolean }) {
	return (
		<div className="rounded-2xl bg-surface p-5 sm:p-6">
			<div className="skeleton mb-5 w-32" />
			{grid ? (
				<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
					{Array.from({ length: rows }).map((_, i) => (
						<div key={i} className="space-y-3">
							<div className="aspect-[4/3] rounded-lg bg-ink/3" />
							<div className="skeleton" />
						</div>
					))}
				</div>
			) : (
				<ul className="space-y-4">
					{Array.from({ length: rows }).map((_, i) => (
						<li key={i} className="flex gap-3">
							<div className="size-14 flex-shrink-0 rounded-lg bg-ink/3" />
							<div className="flex-1 space-y-1">
								<div className="skeleton w-16" />
								<div className="skeleton-2" />
							</div>
						</li>
					))}
				</ul>
			)}
		</div>
	)
}

export function PostPreviewSkeleton() {
	return (
		<div className="flex h-full flex-col space-y-3 rounded-2xl bg-surface p-4">
			<div className="aspect-video rounded-lg bg-ink/3" />
			<div className="skeleton w-20" />
			<div className="skeleton-2" />
			<div className="grow">
				<div className="skeleton-2" />
			</div>
			<div className="flex items-center gap-2">
				<div className="size-6 rounded-full bg-ink/3" />
				<div className="skeleton w-24" />
			</div>
			<div className="flex gap-4 border-t border-line-soft pt-3">
				<div className="skeleton w-20" />
				<div className="skeleton w-16" />
			</div>
		</div>
	)
}
