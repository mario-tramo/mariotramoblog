export default function ({ value }: { value?: string }) {
	if (!value) return null

	const date = new Date(value.includes('T') ? value : value + 'T00:00:00')
	if (isNaN(date.getTime())) return null

	const formatted = date.toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	})

	return <time dateTime={value}>{formatted}</time>
}
