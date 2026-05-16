import NewsletterSubscribe from '@/ui/features/newsletter'
import { cn } from '@/lib/utils'

const VARIANT_MAP = {
	hero: 'extended',
	inline: 'inline',
	compact: 'compact',
} as const

export default function NewsletterBlock({
	variant,
	title,
	description,
	nested,
}: Partial<Sanity.NewsletterBlock> & Partial<{ nested: boolean }>) {
	const mappedVariant = variant ? VARIANT_MAP[variant] : undefined
	const Tag = nested ? 'div' : 'section'

	return (
		<Tag className={cn(!nested && 'section')}>
			<div className="mx-auto max-w-screen-md">
				<NewsletterSubscribe
					variant={mappedVariant}
					title={title}
					description={description}
				/>
			</div>
		</Tag>
	)
}
