import { getSite } from '@/sanity/lib/queries'
import Navigation from './Navigation'
import Social from '@/ui/Social'
import { PortableText } from 'next-sanity'
import Link from 'next/link'
import { Img } from '@/ui/Img'

export default async function Footer() {
	const { title, blurb, logo, copyright } = await getSite()

	return (
		<footer className="bg-surface text-ink" role="contentinfo">
			<div className="section flex flex-wrap gap-x-12 gap-y-8 max-lg:flex-col">
				{/* Left column: Logo + blurb + social */}
				<div className="flex flex-col gap-3">
					<Link className="h3 md:h2 max-w-max" href="/">
						{logo ? (
							<Img
								className="max-h-[1.5em] w-auto"
								image={logo}
								alt={title}
							/>
						) : (
							<span className="text-gradient font-extrabold tracking-tight">
								{title}
							</span>
						)}
					</Link>

					{blurb && (
						<div className="max-w-sm text-sm text-muted">
							<PortableText value={blurb} />
						</div>
					)}

					<Social className="-ml-2" />
				</div>

				{/* Navigation columns */}
				<Navigation />
			</div>

			{copyright && (
				<div className="border-ink/10 mx-auto flex max-w-screen-xl flex-wrap justify-center gap-x-6 gap-y-2 border-t p-4 pb-[max(1rem,env(safe-area-inset-bottom))] text-sm text-muted [&_a:hover]:underline">
					<PortableText value={copyright} />
				</div>
			)}
		</footer>
	)
}
