import Link from 'next/link'
import type { ReactNode } from 'react'

/**
 * Keyword → internal link mapping for auto contextual linking.
 * Each keyword is linked at most once per article to avoid over-optimization.
 * Case-insensitive matching, whole-word only.
 */
const KEYWORDS: { pattern: RegExp; href: string }[] = [
	{ pattern: /\bSerie A\b/i, href: '/calcio' },
	{ pattern: /\bChampions League\b/i, href: '/champions-league' },
	{ pattern: /\bPremier League\b/i, href: '/premier-league' },
	{ pattern: /\bLa Liga\b/i, href: '/la-liga' },
	{ pattern: /\bBundesliga\b/i, href: '/bundesliga' },
	{ pattern: /\bLigue 1\b/i, href: '/ligue-1' },
	{ pattern: /\bCalciomercato\b/i, href: '/calciomercato' },
	{ pattern: /\bFantacalcio\b/i, href: '/fantacalcio' },
	{ pattern: /\bFormula 1\b/i, href: '/formula-1' },
	{ pattern: /\bMotoGP\b/i, href: '/motogp' },
	{ pattern: /\bCoppa Davis\b/i, href: '/tennis' },
	{ pattern: /\bRoland Garros\b/i, href: '/tornei-slam' },
	{ pattern: /\bWimbledon\b/i, href: '/tornei-slam' },
	{ pattern: /\bUS Open\b/i, href: '/tornei-slam' },
	{ pattern: /\bAustralian Open\b/i, href: '/tornei-slam' },
]

/**
 * Process a text string and return ReactNodes with auto-linked keywords.
 * Each keyword is linked at most once (tracked via the `used` Set).
 */
export function autoLinkText(
	text: string,
	used: Set<string>,
): ReactNode[] {
	const nodes: ReactNode[] = []
	let remaining = text

	while (remaining.length > 0) {
		let earliestMatch: { index: number; length: number; href: string; matched: string } | null = null

		for (const { pattern, href } of KEYWORDS) {
			if (used.has(href)) continue
			const match = pattern.exec(remaining)
			if (match && (!earliestMatch || match.index < earliestMatch.index)) {
				earliestMatch = {
					index: match.index,
					length: match[0].length,
					href,
					matched: match[0],
				}
			}
		}

		if (!earliestMatch) {
			nodes.push(remaining)
			break
		}

		// Text before the match
		if (earliestMatch.index > 0) {
			nodes.push(remaining.slice(0, earliestMatch.index))
		}

		// The linked keyword
		used.add(earliestMatch.href)
		nodes.push(
			<Link
				key={`${earliestMatch.href}-${earliestMatch.index}`}
				href={earliestMatch.href}
			>
				{earliestMatch.matched}
			</Link>,
		)

		remaining = remaining.slice(earliestMatch.index + earliestMatch.length)
	}

	return nodes
}
