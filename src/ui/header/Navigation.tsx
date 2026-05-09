import { getSite } from '@/sanity/lib/queries'
import CTA from '@/ui/CTA'
import LinkList from './LinkList'
import { cn } from '@/lib/utils'

export default async function Menu() {
	const { headerLinks } = await getSite()

	const linkClassName = cn(
		'text-[13px] font-medium text-white/60 hover:text-white transition-colors',
	)

	return (
		<nav
			className="max-md:anim-fade-to-r max-md:header-closed:hidden flex items-center gap-1 [grid-area:nav] max-md:my-4 max-md:flex-col max-md:items-start md:justify-center"
			role="navigation"
		>
			{headerLinks?.map((item, key) => {
				switch (item._type) {
					case 'link':
						return (
							<CTA
								className={cn(linkClassName, 'px-3 py-2')}
								link={item}
								key={key}
							/>
						)

					case 'link.list':
						return (
							<LinkList
								summaryClassName={cn(linkClassName, 'px-3 py-2')}
								{...item}
								key={key}
							/>
						)

					default:
						return null
				}
			})}
		</nav>
	)
}
