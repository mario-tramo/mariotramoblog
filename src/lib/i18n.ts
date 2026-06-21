import type { Language } from '@sanity/document-internationalization'

export const supportedLanguages = [
	{ id: 'it', title: 'Italiano' },
] as const as Language[]

export const languages = supportedLanguages.map((lang) => lang?.id)

export const DEFAULT_LANG = 'it'

export type Lang = (typeof languages)[number]

export const langCookieName = `sanitypress-${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}-lang`
