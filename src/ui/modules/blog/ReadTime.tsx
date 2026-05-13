export default function ReadTime({
	value,
	...props
}: { value?: number } & React.ComponentProps<'span'>) {
	if (!value || value <= 0) return null

	const minutes = Math.ceil(value)

	return (
		<span {...props}>
			{minutes} min di lettura
		</span>
	)
}
