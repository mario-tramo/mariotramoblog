export default function StandingsSkeleton() {
	return (
		<section className="section">
			<div className="mx-auto max-w-screen-lg">
				{/* Header */}
				<header className="mb-6 flex items-center gap-3">
					<div className="size-8 rounded-full bg-ink/3" />
					<div className="space-y-1">
						<div className="skeleton h-5 w-40" />
						<div className="skeleton h-4 w-24" />
					</div>
				</header>

				{/* Table */}
				<div className="overflow-x-auto rounded-lg border border-line">
					<table className="w-full text-left text-sm">
						<thead>
							<tr className="bg-surface border-b border-line text-xs uppercase tracking-wider text-white/60">
								<th className="px-3 py-3 text-center">#</th>
								<th className="px-3 py-3">Squadra</th>
								<th className="px-3 py-3 text-center">Pt</th>
								<th className="hidden px-3 py-3 text-center sm:table-cell">G</th>
								<th className="hidden px-3 py-3 text-center sm:table-cell">V</th>
								<th className="hidden px-3 py-3 text-center sm:table-cell">N</th>
								<th className="hidden px-3 py-3 text-center sm:table-cell">S</th>
								<th className="hidden px-3 py-3 text-center md:table-cell">GF</th>
								<th className="hidden px-3 py-3 text-center md:table-cell">GS</th>
								<th className="hidden px-3 py-3 text-center md:table-cell">DR</th>
							</tr>
						</thead>
						<tbody>
							{Array.from({ length: 10 }).map((_, i) => (
								<tr key={i} className="border-b border-line-soft">
									<td className="px-3 py-2.5 text-center">
										<div className="mx-auto h-4 w-4 rounded bg-ink/3" />
									</td>
									<td className="px-3 py-2.5">
										<div className="flex items-center gap-2">
											<div className="size-5 rounded-full bg-ink/3" />
											<div className="skeleton h-4 w-28" />
										</div>
									</td>
									<td className="px-3 py-2.5 text-center">
										<div className="mx-auto h-4 w-6 rounded bg-ink/3" />
									</td>
									<td className="hidden px-3 py-2.5 text-center sm:table-cell">
										<div className="mx-auto h-4 w-5 rounded bg-ink/3" />
									</td>
									<td className="hidden px-3 py-2.5 text-center sm:table-cell">
										<div className="mx-auto h-4 w-5 rounded bg-ink/3" />
									</td>
									<td className="hidden px-3 py-2.5 text-center sm:table-cell">
										<div className="mx-auto h-4 w-5 rounded bg-ink/3" />
									</td>
									<td className="hidden px-3 py-2.5 text-center sm:table-cell">
										<div className="mx-auto h-4 w-5 rounded bg-ink/3" />
									</td>
									<td className="hidden px-3 py-2.5 text-center md:table-cell">
										<div className="mx-auto h-4 w-5 rounded bg-ink/3" />
									</td>
									<td className="hidden px-3 py-2.5 text-center md:table-cell">
										<div className="mx-auto h-4 w-5 rounded bg-ink/3" />
									</td>
									<td className="hidden px-3 py-2.5 text-center md:table-cell">
										<div className="mx-auto h-4 w-5 rounded bg-ink/3" />
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</section>
	)
}
