import type { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL!.replace(/\/+$/, '')

// Training-only AI crawlers that do NOT power search/answer engines —
// blocking these prevents model training while still allowing AI citation
// and referral traffic from ChatGPT Search, Perplexity, Google AI Overviews,
// and other AI answer engines.
//
// SEARCH/ANSWER AI crawlers (GPTBot, ChatGPT-User, OAI-SearchBot,
// Google-Extended, PerplexityBot, Perplexity-User, anthropic-ai, Claude-Web,
// Applebot-Extended, DuckDuckBot-AI, Omgilibot, Cohere-AI) are deliberately
// ALLOWED via the wildcard `*` rule so that this site can be cited and
// discovered through AI-powered search experiences.
const AI_TRAINING_CRAWLERS = [
	'CCBot', // Common Crawl — used by many AI models for training only
	'ClaudeBot', // Anthropic training crawler (Claude-Web is the search crawler)
	'Meta-ExternalAgent', // Meta AI training crawler
]

export default function robots(): MetadataRoute.Robots {
	return {
		rules: [
			{
				userAgent: '*',
				allow: ['/', '/_next/static/'],
				disallow: ['/admin', '/api/', '/_next/', '/legal/draft', '/test-cards', '/og-playground'],
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
