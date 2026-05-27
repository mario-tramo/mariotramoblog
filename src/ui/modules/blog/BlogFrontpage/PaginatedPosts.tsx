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
					<li>Nessun articolo trovato...</li>
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
