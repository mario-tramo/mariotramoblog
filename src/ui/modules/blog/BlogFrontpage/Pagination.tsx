import Link from 'next/link'

export default function Pagination({
	currentPage,
	totalPages,
	basePath,
	searchParams,
}: {
	currentPage: number
	totalPages: number
	basePath: string
	searchParams?: Record<string, string | string[] | undefined>
}) {
	if (totalPages <= 1) return null

	function pageUrl(page: number) {
		const params = new URLSearchParams()
		// Preserve existing search params (e.g. categoria)
		if (searchParams) {
			for (const [key, val] of Object.entries(searchParams)) {
				if (key === 'page' || val == null) continue
				params.set(key, Array.isArray(val) ? val[0] ?? '' : val)
			}
		}
		if (page > 1) params.set('page', String(page))
		const qs = params.toString()
		return qs ? `${basePath}?${qs}` : basePath
	}

	return (
		<nav className="frosted-glass sticky bottom-0 flex items-center justify-center gap-4 bg-canvas p-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] tabular-nums">
			{currentPage > 1 ? (
				<Link href={pageUrl(currentPage - 1)} className="hover:underline">
					Prec
				</Link>
			) : (
				<span className="opacity-20">Prec</span>
			)}

			<span>
				{currentPage} di {totalPages}
			</span>

			{currentPage < totalPages ? (
				<Link href={pageUrl(currentPage + 1)} className="hover:underline">
					Succ
				</Link>
			) : (
				<span className="opacity-20">Succ</span>
			)}
		</nav>
	)
}
