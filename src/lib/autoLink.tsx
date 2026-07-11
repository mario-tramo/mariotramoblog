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

interface SpanChild {
	_type: 'span'
	_key: string
	text: string
	marks: string[]
}

interface MarkDef {
	_type: string
	_key: string
	href?: string
}

interface Block {
	_type: string
	_key: string
	style?: string
	children?: SpanChild[]
	markDefs?: MarkDef[]
	[prop: string]: unknown
}

/**
 * Enrich PortableText blocks with auto-link mark definitions.
 * Mutates neither the input nor the `used` set during render —
 * all matching is done upfront, before React renders.
 */
export function addAutoLinkMarks(blocks: Block[]): Block[] {
	const used = new Set<string>()
	let markKeyCounter = 0

	return blocks.map((block) => {
		if (block._type !== 'block' || !block.children) return block

		const newChildren: SpanChild[] = []
		const newMarks: MarkDef[] = [...(block.markDefs || [])]
		const existingMarkKeys = new Set(newMarks.map((m) => m._key))

		for (const child of block.children) {
			if (child._type !== 'span' || !child.text) {
				newChildren.push(child)
				continue
			}

			const text = child.text
			let remaining = text

			while (remaining.length > 0) {
				let earliestMatch: {
					index: number
					length: number
					href: string
					matched: string
				} | null = null

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

				if (!earliestMatch) break

				const { index, length, href, matched } = earliestMatch

				if (index > 0) {
					newChildren.push({
						_type: 'span',
						_key: `${child._key}-t${newChildren.length}`,
						text: remaining.slice(0, index),
						marks: child.marks,
					})
				}

				const markKey = `auto-link-${markKeyCounter++}`
				if (!existingMarkKeys.has(markKey)) {
					newMarks.push({
						_key: markKey,
						_type: 'link',
						href,
					})
					existingMarkKeys.add(markKey)
				}

				newChildren.push({
					_type: 'span',
					_key: `${child._key}-l${newChildren.length}`,
					text: matched,
					marks: [...(child.marks || []), markKey],
				})

				used.add(href)
				remaining = remaining.slice(index + length)
			}

			if (remaining) {
				newChildren.push({
					_type: 'span',
					_key: `${child._key}-e${newChildren.length}`,
					text: remaining,
					marks: child.marks,
				})
			}
		}

		return { ...block, children: newChildren, markDefs: newMarks }
	})
}
