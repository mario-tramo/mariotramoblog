import NewsletterSubscribe from '@/ui/NewsletterSubscribe'

const VARIANT_MAP = {
	hero: 'extended',
	inline: 'inline',
	compact: 'compact',
} as const

export default function NewsletterBlock({
	variant,
	title,
	description,
}: Partial<Sanity.NewsletterBlock>) {
	const mappedVariant = variant ? VARIANT_MAP[variant] : undefined

	return (
		<section className="section">
			<div className="mx-auto max-w-screen-md">
				<NewsletterSubscribe
					variant={mappedVariant}
					title={title}
					description={description}
				/>
			</div>
		</section>
	)
}
