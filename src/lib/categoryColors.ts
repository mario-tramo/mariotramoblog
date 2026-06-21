/**
 * Per-category color map.
 * If the category has a `color` field in Sanity, that takes priority.
 * Otherwise we fall back to this slug-based map.
 */

const CATEGORY_COLORS: Record<string, string> = {
	// Calcio
	calcio: '#1b8a2f',
	'serie-a': '#1b8a2f',
	'champions-league': '#1a3c8f',
	'premier-league': '#3d1359',
	'la-liga': '#d4760a',
	'ligue-1': '#0e5c3a',
	bundesliga: '#c62828',
	'calcio-estero': '#2e7d32',
	calciomercato: '#b8860b',
	fantacalcio: '#6a1b9a',

	// Motori
	'formula-1': '#c62828',
	ferrari: '#c62828',
	piloti: '#e65100',
	motogp: '#d84315',
	motori: '#e65100',

	// Tennis
	tennis: '#00796b',
	'tennis-italia': '#00897b',
	'tornei-slam': '#00695c',

	// Basket
	basket: '#e65100',

	// Altri sport
	pallavolo: '#1565c0',
	ciclismo: '#f9a825',
	rugby: '#4e342e',

	// Editoriale
	opinioni: '#5c6bc0',
	tattiche: '#37474f',
	curiosita: '#8e24aa',
	betting: '#ffc107',

	// Altro
	altro: '#546e7a',
}

const DEFAULT_COLOR = '#0ea5e9'

export function getCategoryColor(category?: {
	slug?: { current?: string }
	color?: string
}): string {
	if (!category) return DEFAULT_COLOR
	if (category.color) return category.color
	const slug = category.slug?.current
	if (slug && slug in CATEGORY_COLORS) return CATEGORY_COLORS[slug]
	return DEFAULT_COLOR
}
