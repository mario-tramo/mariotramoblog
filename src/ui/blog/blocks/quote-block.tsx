interface QuoteBlockProps {
	value: {
		quote: string
		author: string
		role?: string
		image?: { asset?: { _ref: string } }
		context?: string
	}
}

export function QuoteBlock({ value }: QuoteBlockProps) {
	return (
		<blockquote data-sanity-id="quoteBlock" className="my-8 border-l border-accent py-4 pl-6" style={{ borderLeftWidth: 'thick' }}>
			<p className="text-xl font-bold italic leading-relaxed text-ink sm:text-2xl">
				<span className="text-accent text-3xl font-serif leading-none select-none" aria-hidden="true">
					{'\u201C\u201C'}
				</span>
				{' '}{'\u201C'}{value.quote}{'\u201D'}
			</p>

			<footer className="mt-3">
				<cite className="not-italic text-sm text-muted">
					— {value.author}
				</cite>
			</footer>
		</blockquote>
	)
}
