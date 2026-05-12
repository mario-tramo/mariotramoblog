'use client'

import { useState, useRef, useEffect } from 'react'
import { FiSearch, FiMenu, FiX, FiChevronDown } from 'react-icons/fi'
import Link from 'next/link'

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
				className="flex items-center gap-1 text-[#c9d1d9] hover:text-white text-[15px] font-normal py-2 transition-colors"
				onClick={() => setOpen((v) => !v)}
				aria-expanded={open}
			>
				{item.label}
				<FiChevronDown
					size={14}
					className={`transition-transform ${open ? 'rotate-180' : ''}`}
				/>
			</button>

			{open && (
				<ul className="absolute top-full left-0 mt-1 min-w-[180px] bg-[#161b22] border border-[#30363d] rounded-md py-1 shadow-lg z-50">
					{item.children?.map((child) => (
						<li key={child.href}>
							<Link
								href={child.href}
								className="block px-4 py-2 text-sm text-[#c9d1d9] hover:text-white hover:bg-[#1c2128] transition-colors"
								onClick={() => setOpen(false)}
							>
								{child.label}
							</Link>
						</li>
					))}
				</ul>
			)}
		</div>
	)
}

export default function HeaderContent({ navItems, ctas }: HeaderContentProps) {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
	const [mobileExpanded, setMobileExpanded] = useState<string | null>(null)

	return (
		<>
			<header className="bg-[#0d1117] border-b border-[#21262d]">
				<div className="max-w-[1400px] mx-auto px-4 md:px-6">
					<div className="flex items-center justify-between h-[60px]">
						{/* Mobile Menu Button */}
						<button
							className="md:hidden text-white/90 hover:text-white p-2 -ml-2"
							onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
							aria-label="Toggle menu"
						>
							{mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
						</button>

						{/* Logo */}
						<div className="flex items-center">
							<Link href="/" className="flex items-center">
								<span className="text-[#4fc3dc] font-bold text-2xl italic tracking-tight">
									TM
								</span>
								<span className="text-white font-light text-2xl italic tracking-tight ml-0.5">
									SPORT
								</span>
							</Link>
						</div>

						{/* Desktop Navigation */}
						<nav className="hidden md:flex items-center justify-center flex-1 mx-16">
							<div className="flex items-center gap-6">
								{navItems.map((item) =>
									item.children?.length ? (
										<DesktopDropdown key={item.label} item={item} />
									) : (
										<Link
											key={item.label}
											href={item.href}
											className="text-[#c9d1d9] hover:text-white text-[15px] font-normal py-2 transition-colors"
										>
											{item.label}
										</Link>
									),
								)}
							</div>
						</nav>

						{/* Right Actions */}
						<div className="flex items-center gap-3">
							<Link
								href="/search"
								className="text-[#c9d1d9] hover:text-white p-2.5 transition-colors"
								aria-label="Search"
							>
								<FiSearch size={20} />
							</Link>

							{ctas?.map((cta, i) => (
								<Link
									key={i}
									href={cta.href}
									className="hidden md:block ml-4 text-[#4fc3dc] border border-[#4fc3dc] hover:bg-[#4fc3dc]/10 text-sm font-medium px-5 py-1.5 rounded transition-colors"
								>
									{cta.label}
								</Link>
							))}
						</div>
					</div>
				</div>
			</header>

			{/* Mobile Menu Dropdown */}
			{mobileMenuOpen && (
				<div className="md:hidden bg-[#0d1117] border-b border-[#21262d]">
					<nav className="flex flex-col px-4 py-3">
						{navItems.map((item, index) =>
							item.children?.length ? (
								<div
									key={item.label}
									className={
										index < navItems.length - 1
											? 'border-b border-[#1c2128]'
											: ''
									}
								>
									<button
										className="flex items-center justify-between w-full text-[#c9d1d9] hover:text-white text-[15px] py-3 transition-colors"
										onClick={() =>
											setMobileExpanded(
												mobileExpanded === item.label
													? null
													: item.label,
											)
										}
									>
										{item.label}
										<FiChevronDown
											size={14}
											className={`transition-transform ${
												mobileExpanded === item.label
													? 'rotate-180'
													: ''
											}`}
										/>
									</button>
									{mobileExpanded === item.label && (
										<ul className="pl-4 pb-2 space-y-1">
											{item.children.map((child) => (
												<li key={child.href}>
													<Link
														href={child.href}
														className="block text-sm text-[#8b949e] hover:text-white py-1.5 transition-colors"
														onClick={() =>
															setMobileMenuOpen(false)
														}
													>
														{child.label}
													</Link>
												</li>
											))}
										</ul>
									)}
								</div>
							) : (
								<Link
									key={item.label}
									href={item.href}
									className={`text-[#c9d1d9] hover:text-white text-[15px] py-3 transition-colors ${
										index < navItems.length - 1
											? 'border-b border-[#1c2128]'
											: ''
									}`}
									onClick={() => setMobileMenuOpen(false)}
								>
									{item.label}
								</Link>
							),
						)}

						{ctas?.map((cta, i) => (
							<Link
								key={i}
								href={cta.href}
								className="mt-4 mb-2 text-[#4fc3dc] border border-[#4fc3dc] hover:bg-[#4fc3dc]/10 text-sm font-medium px-5 py-2 rounded transition-colors w-full text-center"
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
