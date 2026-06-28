import type { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL!.replace(/\/+$/, '')

// User-Agents that have a track record of scraping for AI model training or
// out-of-context republication. Listed by AI-training opt-out convention
// (used by major publishers worldwide). Update quarterly.
//
// TRADITIONAL search indexers (Googlebot, Bingbot, FacebookBot, etc.) are
// NOT included here — they are allowed by the wildcard `*` rule so that
// Google News, Discover, and Bing-cited-by-Microsoft-Copilot still work.
const AI_TRAINING_CRAWLERS = [
	'GPTBot',
	'ChatGPT-User',
	'CCBot',
	'anthropic-ai',
	'Claude-Web',
	'ClaudeBot', // Anthropic crawler
	'Google-Extended', // Google AI training, separate from search indexing
	'Applebot-Extended', // Apple Intelligence training opt-out
	'PerplexityBot',
	'Perplexity-User', // Perplexity answer engine
	'DuckDuckBot-AI',
	'Omgilibot',
	'Meta-ExternalAgent', // Meta AI training crawler
	'OAI-SearchBot',
	'Cohere-AI',
]

export default function robots(): MetadataRoute.Robots {
	return {
		rules: [
			{
				userAgent: '*',
				allow: ['/', '/_next/static/'],
				disallow: ['/admin', '/api/', '/_next/', '/legal/draft'],
			},
			// Always block AI training / LLM scrappers — keep the list unique
			// and outside the `*` allow rule to prevent directive conflicts
			// (per robots.txt spec, allow and disallow directives are
			// independent records; a disallow rule wins over a generic allow
			// when applicable to the same UA).
			...AI_TRAINING_CRAWLERS.map((userAgent) => ({
				userAgent,
				disallow: '/',
			})),
		],
		sitemap: [`${BASE_URL}/sitemap.xml`, `${BASE_URL}/news-sitemap.xml`],
		host: BASE_URL,
	}
}
