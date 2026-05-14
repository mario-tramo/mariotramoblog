import StandingsSkeleton from '@/ui/skeletons/StandingsSkeleton'

export default function Loading() {
	return (
		<div className="py-8">
			<header className="section text-center">
				<div className="skeleton mx-auto h-8 w-48" />
				<div className="skeleton mx-auto mt-2 h-5 w-64" />
			</header>

			{Array.from({ length: 5 }).map((_, i) => (
				<StandingsSkeleton key={i} />
			))}
		</div>
	)
}
