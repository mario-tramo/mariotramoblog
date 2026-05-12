'use client'

import { useState } from 'react'
import { FiSearch, FiMenu, FiX } from 'react-icons/fi'
import Link from 'next/link'

export interface NavItem {
	label: string
	href: string
}

export interface CTAItem {
	label: string
	href: string
}

interface HeaderContentProps {
	navItems: NavItem[]
	ctas?: CTAItem[]
}

export default function HeaderContent({ navItems, ctas }: HeaderContentProps) {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

	return (
		<>
			<header className="bg-[#0d1117] border-b border-[#1c2128]">
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
							<div className="flex items-center justify-between w-full max-w-md">
								{navItems.map((item) => (
									<Link
										key={item.label}
										href={item.href}
										className="text-[#c9d1d9] hover:text-white text-[15px] font-normal py-2 transition-colors"
									>
										{item.label}
									</Link>
								))}
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
				<div className="md:hidden bg-[#0d1117] border-b border-[#1c2128]">
					<nav className="flex flex-col px-4 py-3">
						{navItems.map((item, index) => (
							<Link
								key={item.label}
								href={item.href}
								className={`text-[#c9d1d9] hover:text-white text-[15px] py-3 transition-colors ${
									index < navItems.length - 1
										? 'border-b border-[#1c2128]'
										: ''
								}`}
							>
								{item.label}
							</Link>
						))}

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
