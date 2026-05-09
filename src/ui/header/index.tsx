import { getSite } from '@/sanity/lib/queries'
import Wrapper from './Wrapper'
import Link from 'next/link'
import { Img } from '@/ui/Img'
import Navigation from './Navigation'
import CTAList from '@/ui/CTAList'
import Toggle from './Toggle'
import { cn } from '@/lib/utils'
import css from './Header.module.css'

export default async function Header() {
	const { title, logo, ctas } = await getSite()

	return (
		<Wrapper className="frosted-glass border-ink/10 bg-canvas max-md:header-open:shadow-lg sticky top-0 z-10 border-b">
			<div
				className={cn(
					css.header,
					'mx-auto grid max-w-screen-xl items-center gap-x-6 p-4',
				)}
			>
				<div className="[grid-area:logo]">
					<Link
						className={cn('h4 md:h3 grid', logo && 'max-w-3xs')}
						href="/"
					>
						{logo ? (
							<Img
								className="inline-block max-h-[1.2em] w-auto"
								image={logo}
								alt={title}
							/>
						) : (
							<span className="text-gradient">{title}</span>
						)}
					</Link>
				</div>

				<Navigation />

				<CTAList
					ctas={ctas}
					className="max-md:header-closed:hidden [grid-area:ctas] max-md:*:w-full md:ms-auto"
				/>

				<Toggle />
			</div>
		</Wrapper>
	)
}
