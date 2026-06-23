import moduleProps from '@/lib/moduleProps'
import ModuleHeader from '@/ui/primitives/ModuleHeader'
import { cn } from '@/lib/utils'
import type { PortableTextBlock } from '@portabletext/react'

export default function TrustBar({
	pretitle,
	intro,
	stats,
	nested,
	...props
}: Partial<{
	pretitle: string
	intro: PortableTextBlock[]
	stats: { _key: string; value: string; label: string }[]
	nested: boolean
}> &
	Sanity.Module) {
	if (!stats?.length) return null

	const Tag = nested ? 'div' : 'section'

	return (
		<Tag className={cn(!nested && 'section', 'space-y-8')} {...moduleProps(props)}>
			<ModuleHeader pretitle={pretitle} intro={intro} className="richtext text-center" />

			<dl className="mx-auto flex max-w-screen-lg flex-wrap items-start justify-center gap-x-10 gap-y-8 sm:gap-x-16">
				{stats.map(({ _key, value, label }) => (
					<div key={_key} className="text-center">
						<dt className="font-heading text-4xl font-bold leading-none text-ink sm:text-5xl">
							{value}
						</dt>
						<dd className="mt-2 text-sm text-muted sm:text-base">{label}</dd>
					</div>
				))}
			</dl>
		</Tag>
	)
}
