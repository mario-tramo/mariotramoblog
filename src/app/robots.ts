import type { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL!.replace(/\/+$/, '')

export default function robots(): MetadataRoute.Robots {
	return {
		rules: [
			{
				userAgent: '*',
				allow: ['/', '/_next/static/'],
				disallow: ['/admin', '/api/', '/_next/'],
			},
			// Block AI training crawlers
			{ userAgent: 'GPTBot', disallow: '/' },
			{ userAgent: 'ChatGPT-User', disallow: '/' },
			{ userAgent: 'CCBot', disallow: '/' },
			{ userAgent: 'anthropic-ai', disallow: '/' },
			{ userAgent: 'Claude-Web', disallow: '/' },
			{ userAgent: 'Omgilibot', disallow: '/' },
			{ userAgent: 'FacebookBot', allow: '/' },
		],
		sitemap: [`${BASE_URL}/sitemap.xml`, `${BASE_URL}/news-sitemap.xml`],
		host: BASE_URL,
	}
}
