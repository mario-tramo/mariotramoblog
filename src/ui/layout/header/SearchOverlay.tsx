'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Search, X, ArrowRight, Loader2 } from 'lucide-react'
import { searchStore, handleSearch, type SearchScope } from '@/ui/modules/SearchModule/store'
import resolveUrl from '@/lib/resolveUrl'
import { debounce } from '@/lib/utils'
import { useFocusTrap } from '@/lib/useFocusTrap'
import Link from 'next/link'

interface SearchOverlayProps {
	open: boolean
	onClose: () => void
	scope?: SearchScope
	path?: string
}

export default function SearchOverlay({
	open,
	onClose,
	scope = 'all',
	path,
}: SearchOverlayProps) {
	const inputRef = useRef<HTMLInputElement>(null)
	const trapRef = useFocusTrap<HTMLDivElement>(open)
	const [query, setQueryLocal] = useState('')
	const [activeIndex, setActiveIndex] = useState(-1)
	const listRef = useRef<HTMLUListElement>(null)
	const { loading, results, setLoading, setResults } = searchStore()

	const listboxId = 'search-results-listbox'

	useEffect(() => {
		if (!open) {
			setQueryLocal('')
			setResults([])
			setActiveIndex(-1)
		} else {
			setTimeout(() => inputRef.current?.focus(), 50)
		}
	}, [open, setResults])

	const debouncedSearch = useCallback(
		debounce((value: string) => {
			handleSearch({
				query: value,
				scope,
				path,
				setQuery: () => {},
				setLoading,
				setResults,
			})
		}, 400),
		[scope, path, setLoading, setResults],
	)

	function onChange(e: React.ChangeEvent<HTMLInputElement>) {
		const value = e.target.value
		setQueryLocal(value)
		setActiveIndex(-1)
		if (!value.trim()) {
			setResults([])
			return
		}
		debouncedSearch(value)
	}

	function handleResultClick() {
		window.scrollTo(0, 0)
		onClose()
	}

	function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
		if (!results.length) return

		switch (e.key) {
			case 'ArrowDown': {
				e.preventDefault()
				setActiveIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0))
				break
			}
			case 'ArrowUp': {
				e.preventDefault()
				setActiveIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1))
				break
			}
			case 'Enter': {
				e.preventDefault()
				if (activeIndex >= 0 && activeIndex < results.length) {
					const link = listRef.current?.querySelectorAll<HTMLAnchorElement>('a')[activeIndex]
					link?.click()
				}
				break
			}
			case 'Home': {
				e.preventDefault()
				setActiveIndex(0)
				break
			}
			case 'End': {
				e.preventDefault()
				setActiveIndex(results.length - 1)
				break
			}
		}
	}

	useEffect(() => {
		if (activeIndex < 0 || !listRef.current) return
		const links = listRef.current.querySelectorAll<HTMLAnchorElement>('a')
		links[activeIndex]?.focus()
	}, [activeIndex])

	if (!open) return null

	return (
		<div ref={trapRef} className="fixed inset-0 z-50 flex flex-col" role="dialog" aria-modal="true" aria-label="Ricerca">
			{/* Backdrop */}
			<button
				type="button"
				className="absolute inset-0 bg-canvas/80 backdrop-blur-sm"
				onClick={onClose}
				aria-label="Chiudi ricerca"
			/>

			{/* Modal container */}
			<div className="relative mx-auto flex w-full max-w-2xl flex-col px-4 pt-[15vh] sm:pt-[20vh]">
				{/* Search input area */}
				<div className="animate-in fade-in slide-in-from-top-4 duration-200" role="combobox" aria-expanded={query.trim() && results.length > 0 ? true : false} aria-haspopup="listbox" aria-controls={listboxId}>
					<div className="flex items-center gap-3 rounded-2xl bg-surface-light px-4 py-3 shadow-2xl shadow-black/30">
						{loading ? (
							<Loader2
								size={20}
								className="shrink-0 animate-spin text-muted"
								aria-hidden="true"
							/>
						) : (
							<Search size={20} className="shrink-0 text-muted" aria-hidden="true" />
						)}

						<input
							ref={inputRef}
							type="search"
							value={query}
							onChange={onChange}
							onKeyDown={onKeyDown}
							placeholder="Cerca articoli, pagine..."
							className="min-w-0 flex-1 bg-transparent text-lg text-ink outline-none placeholder:text-muted/60"
							aria-label="Cerca"
							aria-autocomplete="list"
							aria-controls={listboxId}
							aria-activedescendant={activeIndex >= 0 ? `search-result-${activeIndex}` : undefined}
						/>

						<button
							type="button"
							onClick={onClose}
							className="grid size-8 shrink-0 place-items-center rounded-lg text-muted transition-colors hover:bg-canvas hover:text-ink"
							aria-label="Chiudi ricerca"
						>
							<X size={18} />
						</button>
					</div>

					{/* Keyboard hint */}
					<div className="mt-2 hidden justify-end px-2 sm:flex">
						<kbd className="rounded bg-surface px-1.5 py-0.5 text-[10px] font-medium text-muted">
							ESC
						</kbd>
					</div>
				</div>

				{/* Results */}
				{query.trim() && (
					<div className="animate-in fade-in slide-in-from-top-2 mt-2 max-h-[50vh] overflow-y-auto overscroll-contain rounded-2xl bg-surface-light shadow-2xl shadow-black/30 sm:max-h-[40vh]">
						{loading ? (
							<div className="flex items-center justify-center gap-2 px-4 py-8 text-sm text-muted">
								<Loader2 size={16} className="animate-spin" />
								Ricerca in corso...
							</div>
						) : results.length > 0 ? (
							<ul ref={listRef} id={listboxId} role="listbox" aria-label="Risultati di ricerca" className="divide-y divide-line-soft py-1">
								{results.map((result, i) => (
									<li key={result._id} id={`search-result-${i}`} role="option" aria-selected={i === activeIndex}>
										<Link
											href={resolveUrl(result, { base: false })}
											scroll={true}
											onClick={handleResultClick}
											className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-canvas"
											tabIndex={-1}
										>
											<div className="min-w-0 flex-1">
												<p className="truncate text-sm font-medium text-ink">
													{result.title || result.metadata.title}
												</p>
												{result.metadata.description && (
													<p className="mt-0.5 truncate text-xs text-muted">
														{
															result.metadata
																.description
														}
													</p>
												)}
											</div>

											<span className="shrink-0 rounded-full bg-canvas px-2 py-0.5 text-[10px] font-medium text-muted">
												{result._type === 'blog.post'
													? 'Blog'
													: 'Pagina'}
											</span>

											<ArrowRight
												size={14}
												className="shrink-0 text-muted/40"
												aria-hidden="true"
											/>
										</Link>
									</li>
								))}
							</ul>
						) : (
							<div className="px-4 py-8 text-center">
								<p className="text-sm text-muted">
									Nessun risultato per &ldquo;
									<span className="font-medium text-ink">
										{query}
									</span>
									&rdquo;
								</p>
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	)
}
