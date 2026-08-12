import { stegaClean } from '@sanity/client/stega'

export type SectionTheme = {
	/** CSS utility defined in app.css — image band + readability overlay */
	bg: string
	/** Accent color for the title underline */
	accent: string
	/** Fallback intro copy shown in the section rail (design clone) */
	intro: string
	/** Fallback "Vedi tutti" target when the module has no category */
	href?: string
}

/**
 * Hardcoded per-section themes for the homepage bands (design:
 * src/lib/nuove_sezioni_design.png, assets: public/sections/).
 * Keyed by the module's pretitle/title, normalized. Takes priority over
 * any background configured in Sanity.
 */
const SECTION_THEMES: Record<string, SectionTheme> = {
	calcio: {
		bg: 'bg-section-calcio',
		accent: '#00AEEF',
		intro: 'Tutte le notizie, risultati e approfondimenti dal mondo del calcio.',
		href: '/calcio',
	},
	'in evidenza': {
		bg: 'bg-section-in-evidenza',
		accent: '#00AEEF',
		intro: 'Gli articoli e le storie più importanti del momento.',
	},
	calciomercato: {
		bg: 'bg-section-calciomercato',
		accent: '#00AEEF',
		intro: 'Tutte le trattative, le voci e gli aggiornamenti di mercato.',
		href: '/calciomercato',
	},
	'formula 1': {
		bg: 'bg-section-formula-1',
		accent: '#E53935',
		intro: 'Notizie, gare e analisi dal mondo della Formula 1.',
		href: '/formula-1',
	},
	tennis: {
		bg: 'bg-section-tennis',
		accent: '#35B86B',
		intro: 'Tornei, risultati e protagonisti del circuito mondiale.',
		href: '/tennis',
	},
	basket: {
		bg: 'bg-section-basket',
		accent: '#F28C28',
		intro: 'NBA, Eurolega e tutto il mondo del basket.',
		href: '/basket',
	},
	opinioni: {
		bg: 'bg-section-opinioni',
		accent: '#A855F7',
		intro: 'Editoriali, analisi e opinioni sul mondo dello sport.',
		href: '/opinioni',
	},
}

export function getSectionTheme(
	label?: string | null,
): SectionTheme | undefined {
	if (!label) return undefined

	const key = stegaClean(label)
		.trim()
		.toLowerCase()
		.replace(/[\u2010-\u2015_-]+/g, ' ')
		.replace(/\s+/g, ' ')

	return SECTION_THEMES[key]
}
