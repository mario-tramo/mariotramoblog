import NewsletterSubscribe from '@/ui/NewsletterSubscribe'

export default function NewsletterBlock({
	variant,
	title,
	description,
}: Partial<Sanity.NewsletterBlock>) {
	return (
		<section className="section">
			<div className="mx-auto max-w-screen-md">
				<NewsletterSubscribe
					variant={variant}
					title={title}
					description={description}
				/>
			</div>
		</section>
	)
}
