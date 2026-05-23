export default function sortFeaturedPosts(
	posts: Sanity.BlogPost[],
	showFeaturedPostsFirst: boolean = true,
) {
	if (showFeaturedPostsFirst)
		return posts.toSorted(
			(a, b) => (b.featured ? 1 : -1) - (a.featured ? 1 : -1),
		)

	return posts
}
