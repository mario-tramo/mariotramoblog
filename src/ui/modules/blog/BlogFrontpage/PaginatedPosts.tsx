import PostPreview from '../PostPreview'
import Pagination from './Pagination'

export default function PaginatedPosts({
	posts,
	currentPage,
	totalPages,
	basePath,
	searchParams,
}: {
	posts: Sanity.BlogPost[]
	currentPage: number
	totalPages: number
	basePath: string
	searchParams?: Record<string, string | string[] | undefined>
}) {
	return (
		<div className="relative space-y-12">
			<ul
				id="blog-list"
				className="grid scroll-mt-[calc(var(--header-height)+1rem)] gap-x-8 gap-y-12 sm:grid-cols-[repeat(auto-fill,minmax(300px,1fr))]"
			>
				{posts.length > 0 ? (
					posts.map((post) => (
						<li className="anim-fade" key={post._id}>
							<PostPreview post={post} />
						</li>
					))
				) : (
					<li className="col-span-full flex flex-col items-center justify-center py-16 text-center">
						<p className="text-3xl font-extrabold tracking-tight">
							Nessun articolo trovato
						</p>
						<p className="mt-2 text-muted">
							Non ci sono ancora articoli in questa sezione.
						</p>
					</li>
				)}
			</ul>

			<Pagination
				currentPage={currentPage}
				totalPages={totalPages}
				basePath={basePath}
				searchParams={searchParams}
			/>
		</div>
	)
}
