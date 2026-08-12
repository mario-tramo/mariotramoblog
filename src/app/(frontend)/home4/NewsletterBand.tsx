import NewsletterSubscribe from '@/ui/features/newsletter'

export default function NewsletterBand() {
	return (
		<section className="section" data-module>
			<div className="relative overflow-hidden rounded-2xl bg-section-in-evidenza p-6 sm:p-8 md:p-10 lg:p-12">
				<div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/40" />
				<div className="relative z-10">
					<span className="text-[10px] font-black uppercase tracking-[0.22em] text-accent">
						La newsletter di TRM Sport
					</span>
					<NewsletterSubscribe
						variant="extended"
						title="La tua dose giornaliera di sport"
						description="Analisi tattiche, calciomercato e risultati: ogni mattina, nella tua inbox."
					/>
				</div>
			</div>
		</section>
	)
}