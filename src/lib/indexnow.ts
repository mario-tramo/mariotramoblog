import { client } from '@/sanity/lib/client'
import groq from 'groq'

const INDEXNOW_API = 'https://api.indexnow.org/indexnow'

function getKey(): string | null {
	return process.env.INDEXNOW_KEY || null
}

function getHost(): string | null {
	const base = process.env.NEXT_PUBLIC_BASE_URL
	if (!base) return null
	return base.replace(/^https?:\/\//, '').replace(/\/+$/, '')
}

export function getKeyLocation(): string | null {
	const key = getKey()
	const host = getHost()
	if (!key || !host) return null
	return `https://${host}/${key}.txt`
}

export async function submitToIndexNow(urls: string[]): Promise<boolean> {
	const key = getKey()
	const host = getHost()
	if (!key || !host || urls.length === 0) return false

	const batchSize = 10
	for (let i = 0; i < urls.length; i += batchSize) {
		const urlList = urls.slice(i, i + batchSize)
		try {
			const res = await fetch(INDEXNOW_API, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					host,
					key,
					keyLocation: getKeyLocation(),
					urlList,
				}),
			})
			if (!res.ok) {
				console.warn(`[indexnow] submission failed (${res.status}):`, await res.text())
			}
		} catch (err) {
			console.warn('[indexnow] network error:', err)
		}
	}
	return true
}

export async function resolveUrlFromDocument(doc: {
	_type?: string | null
	_id?: string | null
	slug?: string | null
}): Promise<string | null> {
	const base = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/+$/, '')
	const slug = doc.slug
	if (!base || !slug) return null

	switch (doc._type) {
		case 'page':
			return slug === 'index' ? base : `${base}/${slug}`
		case 'blog.post': {
			try {
				const result = await client.fetch<{ catSlug?: string } | null>(
					groq`*[_type == 'blog.post' && metadata.slug.current == $slug && defined(categories[0]->slug.current)][0]{
						'catSlug': categories[0]->slug.current
					}`,
					{ slug },
				)
				if (result?.catSlug) return `${base}/${result.catSlug}/${slug}`
			} catch {}
			return null
		}
		case 'blog.category':
			return `${base}/${slug}`
		case 'person':
			return `${base}/autori/${slug}`
		case 'legal':
			return `${base}/legal/${slug}`
		default:
			return null
	}
}
