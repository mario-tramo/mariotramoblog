import errors from './errors'

export const dev = process.env.NODE_ENV === 'development'

export const vercelPreview = process.env.VERCEL_ENV === 'preview'

if (!process.env.NEXT_PUBLIC_BASE_URL) {
	throw new Error(errors.missingBaseUrl)
}

export const BASE_URL = (dev
	? 'http://localhost:3000'
	: process.env.NEXT_PUBLIC_BASE_URL!
).replace(/\/+$/, '')

export const BLOG_DIR = 'blog'

export const CONTACT_NAME =
	process.env.NEXT_PUBLIC_CONTACT_NAME || 'Trm Sport'
export const CONTACT_ADDRESS =
	process.env.NEXT_PUBLIC_CONTACT_ADDRESS || 'Via dello Sport, 1 — 00100 Roma (RM)'
export const CONTACT_EMAIL =
	process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'info@trmsport.com'
