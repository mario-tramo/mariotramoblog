import Pretitle from '@/ui/primitives/Pretitle'
import { PortableText, stegaClean } from 'next-sanity'
import { Suspense } from 'react'
import SearchForm from './SearchForm'
import type { SearchScope } from './store'
import CTAList from '@/ui/primitives/CTAList'
import moduleProps from '@/lib/moduleProps'
import { cn } from '@/lib/utils'
import type { PortableTextBlock } from '@portabletext/react'

export default function SearchModule({
	pretitle,
	intro,
	ctas,
	scope,
	path,
	nested,
	...props
}: Partial<{
	pretitle: string
	intro: PortableTextBlock[]
	ctas: Sanity.CTA[]
	scope: SearchScope
	path: string
	nested: boolean
}>) {
	const Tag = nested ? 'div' : 'section'

	return (
		<Tag className={cn(!nested && 'section', 'space-y-8')} {...moduleProps(props)}>
			{(pretitle || intro) && (
				<header className="richtext text-center">
					<Pretitle>{pretitle}</Pretitle>
					<PortableText value={intro} />
				</header>
			)}

			<div className="mx-auto max-w-screen-sm">
				<Suspense fallback={<div className="skeleton-[calc(1lh+.5rem+2px)]" />}>
					<SearchForm scope={stegaClean(scope)} path={stegaClean(path)} />
				</Suspense>
			</div>

			<CTAList className="justify-center" ctas={ctas} />
		</Tag>
	)
}
