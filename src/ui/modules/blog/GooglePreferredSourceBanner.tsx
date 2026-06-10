const PREFERRED_SOURCE_URL =
	'https://google.com/preferences/source?q=trmsport.com'

export default function GooglePreferredSourceBanner() {
	return (
		<a
			href={PREFERRED_SOURCE_URL}
			target="_blank"
			rel="noopener noreferrer"
			aria-label="Segui TRMsport su Google"
			className="group my-8 flex items-center gap-3 rounded-xl border border-line bg-surface px-5 py-4 transition-all hover:border-brand/40 hover:shadow-[0_4px_20px_rgba(0,0,0,0.25)] sm:gap-4 sm:px-6 sm:py-5"
		>
			{/* Google "G" icon */}
			<svg
				className="size-8 shrink-0 sm:size-10"
				viewBox="0 0 48 48"
				aria-hidden="true"
			>
				<path
					fill="#EA4335"
					d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
				/>
				<path
					fill="#4285F4"
					d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
				/>
				<path
					fill="#FBBC05"
					d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.04 24.04 0 0 0 0 21.56l7.98-6.19z"
				/>
				<path
					fill="#34A853"
					d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
				/>
			</svg>

			<div className="min-w-0">
				<p className="text-sm font-bold leading-tight text-ink sm:text-base">
					Aggiungi TRMsport tra i preferiti
				</p>
				<p className="mt-0.5 text-xs text-muted sm:text-sm">
					Segui le nostre notizie su Google
				</p>
			</div>

			{/* Arrow */}
			<svg
				className="ml-auto size-5 shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-brand"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				strokeWidth={2}
				aria-hidden="true"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					d="M9 5l7 7-7 7"
				/>
			</svg>
		</a>
	)
}
