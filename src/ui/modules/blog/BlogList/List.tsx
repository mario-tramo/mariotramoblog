'use client'

import PostPreview from '../PostPreview'
import { useBlogFilters } from '../store'

export default function List({
	posts,
	cardSize = 'standard',
	...props
}: {
	posts: Sanity.BlogPost[]
	cardSize?: 'standard' | 'large'
} & React.ComponentProps<'ul'>) {
	const filtered = filterPosts(posts)

	if (!filtered.length) {
		return (
			<div className="flex flex-col items-center justify-center py-16 text-center">
				<p className="text-3xl font-extrabold tracking-tight">
					Nessun articolo trovato
				</p>
				<p className="mt-2 text-muted">
					Prova a selezionare un&apos;altra categoria.
				</p>
			</div>
		)
	}

	return (
		<ul {...props}>
			{filtered?.map((post) => (
				<li className="anim-fade" key={post._id}>
					<PostPreview post={post} cardSize={cardSize} />
				</li>
			))}
		</ul>
	)
}

export function filterPosts(posts: Sanity.BlogPost[]) {
	const { category, author } = useBlogFilters()

	return posts.filter((post) => {
		if (category !== 'All' && author)
			return (
				post.authors?.some(({ slug }) => slug?.current === author) &&
				post.categories?.some(({ slug }) => slug?.current === category)
			)

		if (category !== 'All')
			return post.categories?.some(({ slug }) => slug?.current === category)

		if (author)
			return post.authors?.some(({ slug }) => slug?.current === author)

		return true
	})
}
