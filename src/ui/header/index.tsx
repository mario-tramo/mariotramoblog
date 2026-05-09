import { getSite } from '@/sanity/lib/queries'
import Wrapper from './Wrapper'
import Link from 'next/link'
import { Img } from '@/ui/Img'
import Navigation from './Navigation'
import CTAList from '@/ui/CTAList'
import Toggle from './Toggle'
import { cn } from '@/lib/utils'
import css from './Header.module.css'
import { FiSearch } from 'react-icons/fi'

export default async function Header() {
	const { title, logo, ctas } = await getSite()

	return (
		<Wrapper className="bg-canvas sticky top-0 z-10 border-b border-white/5">
			<div
				className={cn(
					css.header,
					'mx-auto grid max-w-screen-xl items-center gap-x-8 px-6 py-3',
				)}
			>
				{/* Logo */}
				<div className="[grid-area:logo]">
					<Link className="flex items-center" href="/">
						{logo ? (
							<Img
								className="inline-block h-8 w-auto"
								image={logo}
								alt={title}
							/>
						) : (
							<span className="text-xl font-black tracking-tight">
								<span className="text-accent">TM</span>{' '}
								<span className="text-white">SPORT</span>
							</span>
						)}
					</Link>
				</div>

				{/* Nav links */}
				<Navigation />

				{/* Right actions */}
				<div className="flex items-center gap-1 [grid-area:ctas] max-md:header-closed:hidden max-md:my-2 md:ms-auto">
					<Link
						href="/search"
						className="rounded-full p-2 text-white/60 transition-colors hover:text-white"
						aria-label="Cerca"
					>
						<FiSearch className="size-[18px]" />
					</Link>

					<CTAList
						ctas={ctas}
						className="max-md:*:w-full"
					/>
				</div>

				{/* Mobile toggle */}
				<Toggle />
			</div>
		</Wrapper>
	)
}
