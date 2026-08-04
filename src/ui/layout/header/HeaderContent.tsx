'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, Menu, X, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import SearchOverlay from './SearchOverlay'
import { useFocusTrap } from '@/lib/useFocusTrap'

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
	return (
		<div className="group relative">
			<button
				type="button"
				className="flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted transition-colors hover:bg-surface hover:text-ink"
				aria-haspopup="true"
				aria-label={`${item.label}, sottomenu`}
			>
				{item.label}
				<ChevronDown
					size={14}
					className="text-muted transition-transform duration-150 group-hover:rotate-180 group-focus-within:rotate-180"
					aria-hidden="true"
				/>
			</button>

			{/* Pure CSS menu: hover or keyboard focus opens it, no JS needed.
			    Always in the DOM so crawlers see the category links. */}
			<ul
				className="invisible absolute top-full left-0 z-50 mt-1 min-w-[180px] translate-y-1 rounded-lg border border-line bg-surface-light py-1 opacity-0 shadow-xl shadow-black/20 transition-all duration-150 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100"
			>
				{item.href !== '#' && (
					<li>
						<Link
							href={item.href}
							className="block border-b border-line px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-ink/5"
						>
							Tutto su {item.label}
						</Link>
					</li>
				)}
				{item.children?.map((child) => (
					<li key={child.href}>
						<Link
							href={child.href}
							className="block px-4 py-2 text-sm text-muted transition-colors hover:bg-ink/5 hover:text-ink"
						>
							{child.label}
						</Link>
					</li>
				))}
			</ul>
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
	const pathname = usePathname()
	const [searchOpen, setSearchOpen] = useState(false)

	const navInputRef = useRef<HTMLInputElement>(null)
	const [navOpen, setNavOpen] = useState(false)
	const drawerRef = useFocusTrap<HTMLDivElement>(navOpen)

	function closeNav() {
		if (navInputRef.current) navInputRef.current.checked = false
		setNavOpen(false)
		document.body.style.overflow = ''
	}

	// Mirror the native checkbox state (open/close + body scroll lock).
	// The drawer itself opens/closes via CSS only (peer-checked), so it
	// works with no JS; this only adds scroll-lock + focus-trap on top.
	useEffect(() => {
		const input = navInputRef.current
		if (!input) return
		const sync = () => {
			setNavOpen(input.checked)
			document.body.style.overflow = input.checked ? 'hidden' : ''
		}
		input.addEventListener('change', sync)
		return () => {
			input.removeEventListener('change', sync)
			document.body.style.overflow = ''
		}
	}, [])

	// Close the drawer when navigating to a new route.
	useEffect(() => {
		closeNav()
	}, [pathname])

	// Escape closes the drawer (enhancement; the X works without JS).
	useEffect(() => {
		if (!navOpen) return
		const handleKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') closeNav()
		}
		document.addEventListener('keydown', handleKey)
		return () => document.removeEventListener('keydown', handleKey)
	}, [navOpen])

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
			{/* Native checkbox controlling the mobile drawer via CSS peer-checked.
			    No JS required: the <label> in the header toggles it, the one inside
			    the drawer closes it. */}
			<input
				id="mobile-nav"
				ref={navInputRef}
				type="checkbox"
				className="peer/nav sr-only"
			/>

			<header className="sticky top-0 z-40 border-b border-line bg-canvas/95 backdrop-blur-md">
				<div className="mx-auto flex h-18 max-w-screen-2xl items-center justify-between gap-4 px-3 sm:px-6">
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
								className="hidden rounded border border-brand px-4 py-1.5 text-sm font-semibold text-brand transition-colors hover:bg-brand-deep hover:text-white md:block"
							>
								{cta.label}
							</Link>
						))}

						<label
							htmlFor="mobile-nav"
							className="grid size-9 cursor-pointer place-items-center rounded-full transition hover:bg-surface lg:hidden"
							role="button"
							aria-label="Apri il menu"
						>
							<Menu size={20} />
						</label>
					</div>
				</div>
			</header>

			{/* Search overlay (JS enhancement) */}
			<SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />

			{/* Mobile drawer — visible only when #mobile-nav is checked (CSS only). */}
			<div
				ref={drawerRef}
				role="dialog"
				aria-modal="true"
				aria-label="Menu di navigazione"
				className="invisible fixed inset-0 z-50 flex translate-y-2 flex-col bg-canvas opacity-0 transition-all duration-150 peer-checked/nav:visible peer-checked/nav:translate-y-0 peer-checked/nav:opacity-100 lg:hidden"
			>
				<div className="flex h-24 items-center justify-between px-3 sm:px-6">
					<Link href="/" className="flex items-center gap-0.5">
						<Logo logoUrl={logoUrl} siteTitle={siteTitle} />
					</Link>
					<label
						htmlFor="mobile-nav"
						className="grid size-9 cursor-pointer place-items-center rounded-full transition hover:bg-surface"
						role="button"
						aria-label="Chiudi"
					>
						<X size={20} />
					</label>
				</div>

				<nav className="flex-1 overflow-y-auto px-2 py-3" aria-label="Navigazione mobile">
					{navItems.map((item) => (
						<div key={item.label} className="border-b border-line-soft">
							{item.children?.length ? (
								<details className="group">
									<summary
										className="flex cursor-pointer list-none items-center justify-between px-3 py-4 text-base font-semibold [&::-webkit-details-marker]:hidden"
										aria-label={`${item.label}, sottomenu`}
									>
										{item.label}
										<ChevronDown
											size={16}
											className="text-muted transition-transform group-open:rotate-180"
											aria-hidden="true"
										/>
									</summary>
									<ul className="space-y-1 pb-3 pl-3">
										{item.children.map((child) => (
											<li key={child.href}>
												<Link
													href={child.href}
													aria-current={pathname === child.href ? 'page' : undefined}
													className="block rounded-md px-3 py-2 text-sm text-muted hover:bg-surface hover:text-ink"
												>
													{child.label}
												</Link>
											</li>
										))}
									</ul>
								</details>
							) : (
								<Link
									href={item.href}
									aria-current={pathname === item.href ? 'page' : undefined}
									className="block px-3 py-4 text-base font-semibold"
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
							className="mt-4 mb-2 block w-full rounded-lg border border-brand px-5 py-2 text-center text-sm font-semibold text-brand transition-colors hover:bg-brand-deep hover:text-white"
						>
							{cta.label}
						</Link>
					))}
				</nav>
			</div>
		</>
	)
}
