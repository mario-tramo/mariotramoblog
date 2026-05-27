import { createClient, groq } from 'next-sanity'
import { projectId, dataset, apiVersion } from '@/sanity/lib/env'
// import { token } from '@/lib/sanity/token'
import { supportedLanguages } from '@/lib/i18n'
import type { NextConfig } from 'next'

const client = createClient({
	projectId,
	dataset,
	// token, // for private datasets
	apiVersion,
	useCdn: true,
})

const securityHeaders = [
	{ key: 'X-DNS-Prefetch-Control', value: 'on' },
	{ key: 'X-Content-Type-Options', value: 'nosniff' },
	{ key: 'X-Frame-Options', value: 'SAMEORIGIN' },
	{ key: 'X-XSS-Protection', value: '1; mode=block' },
	{ key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
	{
		key: 'Permissions-Policy',
		value: 'camera=(), microphone=(), geolocation=()',
	},
	{
		key: 'Strict-Transport-Security',
		value: 'max-age=63072000; includeSubDomains; preload',
	},
]

export default {
	async headers() {
		return [
			{
				source: '/((?!admin|api|_next).*)',
				headers: [
					...securityHeaders,
					{
						key: 'Vercel-CDN-Cache-Control',
						value: 'public, s-maxage=3600, stale-while-revalidate=86400',
					},
				],
			},
			{
				source: '/(admin|api|_next)(.*)',
				headers: securityHeaders,
			},
		]
	},

	images: {
		dangerouslyAllowSVG: true,
		contentDispositionType: 'attachment',
		contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'cdn.sanity.io',
			},
			{
				protocol: 'https',
				hostname: 'avatars.githubusercontent.com',
			},
			{
				protocol: 'https',
				hostname: 'picsum.photos',
			},
		],
	},

	async redirects() {
		return await client.fetch(groq`*[_type == 'redirect']{
			source,
			'destination': select(
				destination.type == 'internal' =>
					select(
						destination.internal->._type == 'blog.post' =>
							'/' + coalesce(destination.internal->.categories[0]->slug.current, '') + '/',
						destination.internal->._type == 'blog.category' =>
							'/',
						'/'
					) + destination.internal->.metadata.slug.current,
				destination.external
			),
			permanent
		}`)
	},

	async rewrites() {
		if (!supportedLanguages?.length) return []

		return []
	},

	env: {
		SC_DISABLE_SPEEDY: 'false',
	},

	// logging: {
	// 	fetches: {
	// 		fullUrl: true,
	// 	},
	// },
} satisfies NextConfig
