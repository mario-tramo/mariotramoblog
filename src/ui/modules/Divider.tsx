export default function Divider({ ...props }: Record<string, unknown> = {}) {
	return (
		<div className="my-16 flex items-center justify-center gap-3 md:my-24" {...props}>
			<div className="h-px flex-1 max-w-32 bg-gradient-to-r from-transparent to-line" />
			<div className="size-1.5 rounded-full bg-brand shadow-[0_0_6px_rgba(198,40,40,0.4)]" />
			<div className="h-px flex-1 max-w-32 bg-gradient-to-l from-transparent to-line" />
		</div>
	)
}
