import { getSite } from '@/sanity/lib/queries'
import CTA from '@/ui/CTA'
import { stegaClean } from 'next-sanity'

export default async function Menu() {
	const { footerLinks } = await getSite()

	return (
		<nav className="flex flex-1 flex-wrap items-start gap-x-12 gap-y-6 max-sm:flex-col">
			{footerLinks?.map((item, key) => (
				<div className="space-y-3 text-start" key={key}>
					<div className="technical text-accent text-xs">
						<CTA link={item.link}>
							{stegaClean(item.link?.label) ||
								item.link?.internal?.title}
						</CTA>
					</div>

					<ul className="space-y-1">
						{item.links?.map((link, key) => (
							<li key={key}>
								<CTA
									className="inline-block py-px text-sm text-muted transition-colors hover:text-ink"
									link={link}
								/>
							</li>
						))}
					</ul>
				</div>
			))}
		</nav>
	)
}
