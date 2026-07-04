import type { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL!.replace(/\/+$/, '')

// Policy: block model TRAINING, allow AI SEARCH/citation.
//
// Training-only AI crawlers do not power search or answer engines, so
// blocking them costs zero AI visibility. The crawlers that produce
// citations and referral traffic are deliberately ALLOWED via the
// wildcard `*` rule: OAI-SearchBot + ChatGPT-User (ChatGPT Search),
// Claude-SearchBot + Claude-User (Claude), PerplexityBot +
// Perplexity-User, Meta-ExternalFetcher, and of course Googlebot
// (AI Overviews use the regular Googlebot crawl). Google-Extended is
// also left allowed because it gates Gemini answer grounding (citations),
// not just training. llms.txt serves these inference-time agents and is
// consistent with this policy.
const AI_TRAINING_CRAWLERS = [
	'CCBot', // Common Crawl — feeds most public training datasets
	'ClaudeBot', // Anthropic training crawler (search is Claude-SearchBot)
	'GPTBot', // OpenAI training crawler (search is OAI-SearchBot)
	'Meta-ExternalAgent', // Meta AI training crawler (fetch is Meta-ExternalFetcher)
	'Applebot-Extended', // Apple Intelligence training opt-out (Siri uses Applebot)
	'Bytespider', // ByteDance training crawler
]

export default function robots(): MetadataRoute.Robots {
	return {
		rules: [
			{
				userAgent: '*',
				allow: ['/', '/_next/static/'],
				disallow: ['/admin', '/api/', '/_next/', '/legal/draft', '/test-cards', '/og-playground'],
			},
			// Training crawlers get their own records: per robots.txt spec a
			// UA-specific record replaces the `*` record entirely for that UA.
			...AI_TRAINING_CRAWLERS.map((userAgent) => ({
				userAgent,
				disallow: '/',
			})),
		],
		sitemap: [`${BASE_URL}/sitemap.xml`, `${BASE_URL}/news-sitemap.xml`],
		host: BASE_URL,
	}
}
