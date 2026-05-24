import CompactNewsletter from './CompactNewsletter'
import ExtendedNewsletter from './ExtendedNewsletter'
import InlineNewsletter from './InlineNewsletter'

export type NewsletterSubscribeProps = {
	variant?: 'compact' | 'extended' | 'inline'
	title?: string
	description?: string
}

const VARIANTS = {
	compact: CompactNewsletter,
	extended: ExtendedNewsletter,
	inline: InlineNewsletter,
} as const

export default function NewsletterSubscribe({
	variant = 'compact',
	title,
	description,
}: NewsletterSubscribeProps) {
	const Component = VARIANTS[variant]
	return <Component title={title} description={description} />
}
