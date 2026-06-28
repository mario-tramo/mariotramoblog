'use client'

import { useFormValue } from 'sanity'
import { Card, Stack, Text, Box } from '@sanity/ui'
import { urlFor } from '@/sanity/lib/image'

const BASE =
	process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/+$/, '') ||
	(() => {
		if (typeof window !== 'undefined') {
			console.warn('NEXT_PUBLIC_BASE_URL non impostata, fallback a localhost:3000')
		}
		return 'http://localhost:3000'
	})()
const domain = BASE.replace(/https?:\/\//, '')

export default function SocialPreview() {
	const docTitle = useFormValue(['title']) as string | undefined
	const seoTitle = useFormValue(['metadata', 'title']) as string | undefined
	const description = useFormValue(['metadata', 'description']) as string | undefined
	const slug = useFormValue(['metadata', 'slug', 'current']) as string | undefined
	const docType = useFormValue(['_type']) as string | undefined
	const publishDate = useFormValue(['publishDate']) as string | undefined
	const image = useFormValue(['metadata', 'image']) as
		| (Sanity.Image & { asset?: { _ref?: string } })
		| undefined
	const firstCategorySlug = useFormValue(['categories', 0, 'slug', 'current']) as string | undefined

	const title = seoTitle || docTitle
	const path =
		docType === 'blog.post'
			? `${firstCategorySlug || 'categoria'}/${slug || ''}`
			: slug || ''
	const displayUrl = `${domain}/${path}`

	// Build the EXACT same OG card URL the site emits, so the editor preview
	// matches what actually gets shared on social.
	const params = new URLSearchParams()
	if (title) params.set('title', title)
	if (description) params.set('description', description)
	if (publishDate) params.set('date', publishDate)
	if (image?.asset?._ref) {
		params.set('image', urlFor(image).width(1200).height(630).fit('crop').url())
	}
	const ogUrl = `${BASE}/api/og?${params.toString()}`

	if (!title && !description) return null

	return (
		<Card padding={4} radius={3} shadow={1} style={{ marginTop: 16 }}>
			<Stack space={3}>
				<Text size={1} weight="semibold" muted>
					Anteprima condivisione social
				</Text>

				<Card
					radius={3}
					style={{
						border: '1px solid var(--card-border-color)',
						overflow: 'hidden',
					}}
				>
					<Box
						style={{
							aspectRatio: '1200 / 630',
							backgroundColor: 'var(--card-bg2-color, #f3f3f6)',
							overflow: 'hidden',
							position: 'relative',
						}}
					>
					{/* Raw <img> preview in Sanity Studio. */}
					<img
							src={ogUrl}
							alt="OG Preview"
							style={{
								width: '100%',
								height: '100%',
								objectFit: 'cover',
								display: 'block',
							}}
						/>
					</Box>

					<Box padding={3}>
						<Stack space={2}>
							<Text size={0} muted style={{ textTransform: 'lowercase' }}>
								{displayUrl}
							</Text>
							<Text
								size={1}
								weight="bold"
								style={{
									display: '-webkit-box',
									WebkitLineClamp: 2,
									WebkitBoxOrient: 'vertical',
									overflow: 'hidden',
								}}
							>
								{title || 'Titolo della pagina'}
							</Text>
							{description && (
								<Text
									size={1}
									muted
									style={{
										display: '-webkit-box',
										WebkitLineClamp: 2,
										WebkitBoxOrient: 'vertical',
										overflow: 'hidden',
									}}
								>
									{description}
								</Text>
							)}
						</Stack>
					</Box>
				</Card>

				<Text size={0} muted>
					Per provare l&apos;anteprima su tutti i social (X, Facebook, WhatsApp,
					LinkedIn, Discord, Google) apri <code>/og-playground</code>.
				</Text>
			</Stack>
		</Card>
	)
}
