import { useQueryState } from 'nuqs'

export const useBlogFilters = () => {
	const [category, setCategory] = useQueryState('categoria', {
		defaultValue: 'All',
		shallow: false,
	})

	const [author, setAuthor] = useQueryState('author', {
		shallow: false,
	})

	return {
		category,
		author,
		setCategory,
		setAuthor,
	}
}
