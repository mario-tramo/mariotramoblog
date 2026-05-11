import { useQueryState } from 'nuqs'

export const useBlogFilters = () => {
	const [category, setCategory] = useQueryState('categoria', {
		defaultValue: 'All',
	})

	const [author, setAuthor] = useQueryState('author')

	return {
		category,
		author,
		setCategory,
		setAuthor,
	}
}
