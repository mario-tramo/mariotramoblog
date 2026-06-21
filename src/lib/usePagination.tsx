'use client'

import { useQueryState, parseAsInteger } from 'nuqs'

type PaginationProps = React.ComponentProps<'div'> &
	Partial<{
		buttonClassName: string
		prevClassName: string
		nextClassName: string
		prev: React.ReactNode
		next: React.ReactNode
		hidePage: boolean
		onClick: () => void
	}>

export function usePagination<T extends unknown>({
	items = [],
	itemsPerPage = 3,
}: {
	items: T[]
	itemsPerPage?: number
}) {
	const { page, setPage } = usePageState()

	const atStart = page === 1
	const atEnd = page === Math.ceil(items.length / itemsPerPage)

	const onPrev = () => setPage(Math.max(1, page - 1))
	const onNext = () =>
		setPage(Math.min(Math.ceil(items.length / itemsPerPage), page + 1))

	const paginatedItems = items.slice(
		itemsPerPage * (page - 1),
		itemsPerPage * page,
	)

	const currentPage = page
	const totalPages = Math.ceil(items.length / itemsPerPage)

	const Pagination = ({
		buttonClassName,
		prevClassName,
		nextClassName,
		prev = 'Precedente',
		next = 'Successiva',
		hidePage,
		onClick = () => {},
		...props
	}: PaginationProps) => {
		if ((atStart && atEnd) || !paginatedItems?.length) return null

		return (
			<nav aria-label="Paginazione" {...props}>
				<button
					className={prevClassName || buttonClassName}
					onClick={() => {
						onPrev()
						onClick()
					}}
					disabled={atStart}
					aria-label="Pagina precedente"
				>
					{prev}
				</button>

				{!hidePage && (
					<span aria-current="page">
						{currentPage} di {totalPages}
					</span>
				)}

				<button
					className={nextClassName || buttonClassName}
					onClick={() => {
						onNext()
						onClick()
					}}
					disabled={atEnd}
					aria-label="Pagina successiva"
				>
					{next}
				</button>
			</nav>
		)
	}

	return {
		atStart,
		atEnd,
		onPrev,
		onNext,
		paginatedItems,
		Pagination,
		currentPage,
		totalPages,
	}
}

export function usePageState() {
	const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1).withOptions({ shallow: false }))
	return { page, setPage }
}
