export default function ({ value }: { value?: string }) {
	if (!value) return null

	const date = new Date(value)

	const formatted = date.toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	})

	return <time dateTime={value}>{formatted}</time>
}
