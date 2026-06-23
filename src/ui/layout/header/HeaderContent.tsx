'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useState, useRef, useEffect, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import { Search, Menu, X, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useFocusTrap } from '@/lib/useFocusTrap'
import { usePathname } from 'next/navigation'
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
	logoUrl?: string
	siteTitle?: string
}

function DesktopDropdown({ item }: { item: NavItem }) {
	const [open, setOpen] = useState(false)
	const ref = useRef<HTMLDivElement>(null)
	const triggerRef = useRef<HTMLButtonElement>(null)
	const menuRef = useRef<HTMLUListElement>(null)
	const timeout = useRef<NodeJS.Timeout>(null)

	function handleEnter() {
		if (timeout.current) clearTimeout(timeout.current)
		setOpen(true)
	}

	function handleLeave() {
		timeout.current = setTimeout(() => setOpen(false), 150)
	}

	useEffect(() => {
		return () => {
			if (timeout.current) clearTimeout(timeout.current)
		}
	}, [])

	useEffect(() => {
		if (open && menuRef.current) {
			const firstLink = menuRef.current.querySelector<HTMLAnchorElement>('a')
			firstLink?.focus()
		}
	}, [open])

	function handleKeyDown(e: ReactKeyboardEvent<HTMLDivElement>) {
		if (!open) return

		const links = menuRef.current?.querySelectorAll<HTMLAnchorElement>('a')
		if (!links?.length) return
		const active = document.activeElement as HTMLElement
		const idx = Array.from(links).indexOf(active as HTMLAnchorElement)

		switch (e.key) {
			case 'Escape':
				e.preventDefault()
				setOpen(false)
				triggerRef.current?.focus()
				break
			case 'ArrowDown':
				e.preventDefault()
				links[idx < links.length - 1 ? idx + 1 : 0]?.focus()
				break
			case 'ArrowUp':
				e.preventDefault()
				links[idx > 0 ? idx - 1 : links.length - 1]?.focus()
				break
			case 'Tab':
				setOpen(false)
				break
		}
	}

	return (
		<div
			ref={ref}
			className="relative"
			onMouseEnter={handleEnter}
			onMouseLeave={handleLeave}
			onKeyDown={handleKeyDown}
		>
			<button
				type="button"
				ref={triggerRef}
				className="flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted transition-colors hover:bg-surface hover:text-ink"
				onClick={() => setOpen((v) => !v)}
				aria-expanded={open}
				aria-haspopup="true"
				aria-label={`${item.label}, sottomenu`}
			>
				{item.label}
				<ChevronDown
					size={14}
					className={`transition-transform ${open ? 'rotate-180' : ''}`}
					aria-hidden="true"
				/>
			</button>

			<AnimatePresence>
				{open && (
					<>
						<motion.ul
							ref={menuRef}
							className="absolute top-full left-0 z-50 mt-1 min-w-[180px] rounded-lg border border-line bg-surface-light py-1 shadow-xl shadow-black/20"
							initial={{ opacity: 0, y: -6 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -6 }}
							transition={{ duration: 0.15, ease: 'easeOut' }}
						>
							{item.children?.map((child) => (
								<li key={child.href}>
									<Link
										href={child.href}
										className="block px-4 py-2 text-sm text-muted transition-colors hover:bg-ink/5 hover:text-ink"
										onClick={() => setOpen(false)}
									>
										{child.label}
									</Link>
								</li>
							))}
						</motion.ul>
						<button
							type="button"
							className="fixed inset-0 -z-10"
							onClick={() => setOpen(false)}
							aria-label="Chiudi sottomenu"
							tabIndex={-1}
						/>
					</>
				)}
			</AnimatePresence>
		</div>
	)
}

function Logo({ logoUrl, siteTitle }: { logoUrl?: string; siteTitle?: string }) {
	if (logoUrl) {
		return (
			<Image
				src={logoUrl}
				alt={siteTitle || 'Logo'}
				width={245}
				height={70}
				className="h-[70px] w-auto"
				priority
			/>
		)
	}

	return (
		<div className="flex flex-col justify-center gap-1 leading-none">
			<span className="font-heading text-2xl uppercase tracking-wide text-ink sm:text-3xl">
				MARIO TRAMO
			</span>
			<span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand sm:text-xs">
				STAY IN THE GAME
			</span>
		</div>
	)
}

export default function HeaderContent({ navItems, ctas, logoUrl, siteTitle }: HeaderContentProps) {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
	const pathname = usePathname()
	const [mobileExpanded, setMobileExpanded] = useState<string | null>(null)
	const [searchOpen, setSearchOpen] = useState(false)
	const mobileDrawerRef = useFocusTrap<HTMLDivElement>(mobileMenuOpen)

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

	useEffect(() => {
		if (!mobileMenuOpen) return
		const handleKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') setMobileMenuOpen(false)
		}
		document.addEventListener('keydown', handleKey)
		return () => document.removeEventListener('keydown', handleKey)
	}, [mobileMenuOpen])

	return (
		<>
			<header
				className="sticky top-0 z-40 border-b border-line bg-canvas/95 backdrop-blur-md"
			>
				<div className="mx-auto flex h-18 max-w-screen-2xl items-center justify-between gap-4 px-3 sm:px-6">
					{/* Logo */}
					<Link href="/" className="flex items-center gap-0.5">
						<Logo logoUrl={logoUrl} siteTitle={siteTitle} />
					</Link>

					{/* Desktop Navigation */}
					<nav className="hidden items-center gap-1 lg:flex" aria-label="Navigazione principale">
						{navItems.map((item) =>
							item.children?.length ? (
								<DesktopDropdown key={item.label} item={item} />
							) : (
								<Link
									key={item.label}
									href={item.href}
									aria-current={pathname === item.href ? 'page' : undefined}
									className="rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted transition-colors hover:bg-surface hover:text-ink"
								>
									{item.label}
								</Link>
							),
						)}
					</nav>

					{/* Right Actions */}
					<div className="flex items-center gap-1 sm:gap-2">
						<button
							type="button"
							onClick={() => setSearchOpen(true)}
							className="flex items-center gap-2 rounded-full border border-line-soft px-4 py-2 text-sm text-ink/80 transition hover:border-ink/20 hover:bg-surface sm:px-5"
							aria-label="Cerca notizie"
						>
							<Search size={16} />
							<span className="hidden sm:inline">Cerca</span>
						</button>

						{ctas?.map((cta, i) => (
							<Link
								key={i}
								href={cta.href}
								className="hidden rounded border border-brand px-4 py-1.5 text-sm font-semibold text-brand transition-colors hover:bg-brand hover:text-brand-foreground md:block"
							>
								{cta.label}
							</Link>
						))}

						<button
							type="button"
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
			<AnimatePresence>
				{mobileMenuOpen && (
					<motion.div
						ref={mobileDrawerRef}
						role="dialog"
						aria-modal="true"
						aria-label="Menu di navigazione"
						className="fixed inset-0 z-50 flex flex-col bg-canvas lg:hidden"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.15, ease: 'easeOut' }}
					>
						<div className="flex h-24 items-center justify-between px-3 sm:px-6">
							<Link
								href="/"
								className="flex items-center gap-0.5"
								onClick={() => setMobileMenuOpen(false)}
							>
								<Logo logoUrl={logoUrl} siteTitle={siteTitle} />
							</Link>
							<button
								type="button"
								className="grid size-9 place-items-center rounded-full transition hover:bg-surface"
								onClick={() => setMobileMenuOpen(false)}
								aria-label="Chiudi"
							>
								<X size={20} />
							</button>
						</div>

						<nav className="flex-1 overflow-y-auto px-2 py-3" aria-label="Navigazione mobile">
							{navItems.map((item) => (
								<div
									key={item.label}
									className="border-b border-line-soft"
								>
									{item.children?.length ? (
										<>
											<button
												type="button"
												className="flex w-full items-center justify-between px-3 py-4 text-base font-semibold"
												onClick={() =>
													setMobileExpanded(
														item.label === mobileExpanded
															? null
															: item.label,
													)
												}
												aria-expanded={mobileExpanded === item.label}
												aria-label={`${item.label}, sottomenu`}
											>
												{item.label}
												<ChevronDown
													size={16}
													className={`text-muted transition-transform ${mobileExpanded === item.label
														? 'rotate-180'
														: ''
														}`}
													aria-hidden="true"
												/>
											</button>
											{mobileExpanded === item.label && (
												<ul className="space-y-1 pb-3 pl-3">
													{item.children.map((child) => (
														<li key={child.href}>
															<Link
																href={child.href}
																aria-current={pathname === child.href ? 'page' : undefined}
																className="block rounded-md px-3 py-2 text-sm text-muted hover:bg-surface hover:text-ink"
																onClick={() => setMobileMenuOpen(false)}
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
											aria-current={pathname === item.href ? 'page' : undefined}
											className="block px-3 py-4 text-base font-semibold"
											onClick={() => setMobileMenuOpen(false)}
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
									className="mt-4 mb-2 block w-full rounded-lg border border-brand px-5 py-2 text-center text-sm font-semibold text-brand transition-colors hover:bg-brand hover:text-brand-foreground"
									onClick={() => setMobileMenuOpen(false)}
								>
									{cta.label}
								</Link>
							))}
						</nav>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	)
}
