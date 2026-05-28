export const bgClasses: Record<string, string> = {
	none: '',
	surface: 'bg-surface',
	soft: 'bg-surface-soft',
	contrast: 'bg-surface-contrast',
	accent: 'bg-accent/5',
	dark: 'bg-ink text-canvas',
	'surface-gradient':
		'bg-gradient-to-br from-[var(--color-surface-grad-from)] to-[var(--color-surface-grad-to)]',
	'soft-gradient':
		'bg-gradient-to-br from-[var(--color-soft-grad-from)] to-[var(--color-soft-grad-to)]',
	'contrast-gradient':
		'bg-gradient-to-br from-[var(--color-contrast-grad-from)] to-[var(--color-contrast-grad-to)]',
	'accent-gradient':
		'bg-gradient-to-br from-[var(--color-accent-grad-from)] to-[var(--color-accent-grad-to)]',
	'dark-gradient':
		'bg-gradient-to-br from-[var(--color-dark-grad-from)] to-[var(--color-dark-grad-to)]',
	'warm-gradient':
		'bg-gradient-to-br from-[var(--color-warm-grad-from)] to-[var(--color-warm-grad-to)]',
	'ocean-gradient':
		'bg-gradient-to-br from-[var(--color-ocean-grad-from)] to-[var(--color-ocean-grad-to)]',
}
