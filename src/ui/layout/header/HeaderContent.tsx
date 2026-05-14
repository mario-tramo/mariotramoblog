'use client'

import { useState, useRef, useEffect } from 'react'
import { Search, Menu, X, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import SearchOverlay from './SearchOverlay'

export interface NavItem {
	label: string
	href: string
	children?: { label: string; href: string }[]
}

export interface CTAItem {
	label: string
	href: string
}

interface HeaderContentProps {
	navItems: NavItem[]
	ctas?: CTAItem[]
}

function DesktopDropdown({ item }: { item: NavItem }) {
	const [open, setOpen] = useState(false)
	const ref = useRef<HTMLDivElement>(null)
	const timeout = useRef<NodeJS.Timeout>(null)

	function handleEnter() {
		if (timeout.current) clearTimeout(timeout.current)
		setOpen(true)
	}

	function handleLeave() {
		timeout.current = setTimeout(() => setOpen(false), 150)
	}

	useEffect(() => () => {
		if (timeout.current) clearTimeout(timeout.current)
	}, [])

	return (
		<div
			ref={ref}
			className="relative"
			onMouseEnter={handleEnter}
			onMouseLeave={handleLeave}
		>
			<button
				className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-surface hover:text-ink"
				onClick={() => setOpen((v) => !v)}
				aria-expanded={open}
			>
				{item.label}
				<ChevronDown
					size={14}
					className={`transition-transform ${open ? 'rotate-180' : ''}`}
				/>
			</button>

			{open && (
				<>
					<ul className="absolute top-full left-0 z-50 mt-2 min-w-[180px] rounded-xl bg-surface-light py-2 shadow-2xl shadow-black/30 backdrop-blur-xl">
						{item.children?.map((child) => (
							<li key={child.href}>
								<Link
									href={child.href}
									className="block px-4 py-2 text-sm text-muted transition-colors hover:bg-surface-light hover:text-ink"
									onClick={() => setOpen(false)}
								>
									{child.label}
								</Link>
							</li>
						))}
					</ul>
					<div
						className="fixed inset-0 -z-10"
						onClick={() => setOpen(false)}
					/>
				</>
			)}
		</div>
	)
}

export default function HeaderContent({ navItems, ctas }: HeaderContentProps) {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
	const [mobileExpanded, setMobileExpanded] = useState<string | null>(null)
	const [searchOpen, setSearchOpen] = useState(false)

	useEffect(() => {
		document.body.style.overflow =
			mobileMenuOpen || searchOpen ? 'hidden' : ''
		return () => {
			document.body.style.overflow = ''
		}
	}, [mobileMenuOpen, searchOpen])

	useEffect(() => {
		if (!searchOpen) return
		const handleKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') setSearchOpen(false)
		}
		document.addEventListener('keydown', handleKey)
		return () => document.removeEventListener('keydown', handleKey)
	}, [searchOpen])

	return (
		<>
			<header className="sticky top-0 z-40 bg-canvas/90 backdrop-blur-xl">
				<div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between gap-4 px-4 sm:h-16 sm:px-6">
					{/* Logo */}
					<Link href="/" className="flex items-center gap-0.5">
						<span className="text-xl font-extrabold italic tracking-tight text-brand">
							TM
						</span>
						<span className="text-xl font-light italic tracking-tight text-ink">
							SPORT
						</span>
					</Link>

					{/* Desktop Navigation */}
					<nav className="hidden items-center gap-1 lg:flex">
						{navItems.map((item) =>
							item.children?.length ? (
								<DesktopDropdown key={item.label} item={item} />
							) : (
								<Link
									key={item.label}
									href={item.href}
									className="rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-surface hover:text-ink"
								>
									{item.label}
								</Link>
							),
						)}
					</nav>

					{/* Right Actions */}
					<div className="flex items-center gap-1 sm:gap-2">
						<button
							onClick={() => setSearchOpen(true)}
							className="grid size-9 place-items-center rounded-full transition hover:bg-surface"
							aria-label="Cerca"
						>
							<Search size={18} />
						</button>

						{ctas?.map((cta, i) => (
							<Link
								key={i}
								href={cta.href}
								className="hidden rounded-lg bg-brand px-5 py-1.5 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand/90 md:block"
							>
								{cta.label}
							</Link>
						))}

						<button
							className="grid size-9 place-items-center rounded-full transition hover:bg-surface lg:hidden"
							onClick={() => setMobileMenuOpen(true)}
							aria-label="Menu"
						>
							<Menu size={20} />
						</button>
					</div>
				</div>
			</header>

			{/* Search overlay */}
			<SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />

			{/* Mobile drawer */}
			{mobileMenuOpen && (
				<div className="fixed inset-0 z-50 flex animate-in fade-in flex-col bg-canvas duration-150 lg:hidden">
					<div className="flex h-14 items-center justify-between px-4">
						<Link
							href="/"
							className="flex items-center gap-0.5"
							onClick={() => setMobileMenuOpen(false)}
						>
							<span className="text-xl font-extrabold italic tracking-tight text-brand">
								TM
							</span>
							<span className="text-xl font-light italic tracking-tight text-ink">
								SPORT
							</span>
						</Link>
						<button
							className="grid size-9 place-items-center rounded-full transition hover:bg-surface"
							onClick={() => setMobileMenuOpen(false)}
							aria-label="Chiudi"
						>
							<X size={20} />
						</button>
					</div>

					<nav className="flex-1 overflow-y-auto px-2 py-3">
						{navItems.map((item) => (
							<div
								key={item.label}
								className="border-b border-ink/5"
							>
								{item.children?.length ? (
									<>
										<button
											className="flex w-full items-center justify-between px-3 py-4 text-base font-semibold"
											onClick={() =>
												setMobileExpanded(
													mobileExpanded ===
														item.label
														? null
														: item.label,
												)
											}
										>
											{item.label}
											<ChevronDown
												size={16}
												className={`text-muted transition-transform ${
													mobileExpanded ===
													item.label
														? 'rotate-180'
														: ''
												}`}
											/>
										</button>
										{mobileExpanded === item.label && (
											<ul className="space-y-1 pb-3 pl-3">
												{item.children.map((child) => (
													<li key={child.href}>
														<Link
															href={child.href}
															className="block rounded-md px-3 py-2 text-sm text-muted hover:bg-surface hover:text-ink"
															onClick={() =>
																setMobileMenuOpen(
																	false,
																)
															}
														>
															{child.label}
														</Link>
													</li>
												))}
											</ul>
										)}
									</>
								) : (
									<Link
										href={item.href}
										className="block px-3 py-4 text-base font-semibold"
										onClick={() =>
											setMobileMenuOpen(false)
										}
									>
										{item.label}
									</Link>
								)}
							</div>
						))}

						{ctas?.map((cta, i) => (
							<Link
								key={i}
								href={cta.href}
								className="mt-4 mb-2 block w-full rounded-lg bg-brand px-5 py-2 text-center text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand/90"
								onClick={() => setMobileMenuOpen(false)}
							>
								{cta.label}
							</Link>
						))}
					</nav>
				</div>
			)}
		</>
	)
}
