'use client'

import { useFormValue } from 'sanity'
import { Card, Stack, Text, Box } from '@sanity/ui'
import { BLOG_DIR } from '@/lib/env'

const domain = process.env.NEXT_PUBLIC_BASE_URL?.replace(/https?:\/\//, '') || 'mariotramo.com'

export default function SocialPreview() {
	const title = useFormValue(['metadata', 'title']) as string | undefined
	const description = useFormValue(['metadata', 'description']) as string | undefined
	const slug = useFormValue(['metadata', 'slug', 'current']) as string | undefined
	const docType = useFormValue(['_type']) as string | undefined

	const path = docType === 'blog.post' ? `${BLOG_DIR}/${slug || ''}` : slug || ''
	const displayUrl = `${domain}/${path}`

	if (!title && !description) return null

	return (
		<Card padding={4} radius={3} shadow={1} style={{ marginTop: 16 }}>
			<Stack space={3}>
				<Text size={1} weight="semibold" muted>
					Anteprima condivisione social
				</Text>

				{/* Twitter / X style card */}
				<Card
					radius={3}
					style={{
						border: '1px solid var(--card-border-color)',
						overflow: 'hidden',
					}}
				>
					{/* OG Image preview */}
					<Box
						style={{
							aspectRatio: '1200 / 630',
							backgroundColor: 'var(--card-bg2-color, #f3f3f6)',
							overflow: 'hidden',
							position: 'relative',
						}}
					>
						<img
							src={`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/og?title=${encodeURIComponent(title ?? '')}`}
							alt="OG Preview"
							style={{
								width: '100%',
								height: '100%',
								objectFit: 'cover',
								display: 'block',
							}}
						/>
					</Box>

					{/* Card body */}
					<Box padding={3}>
						<Stack space={2}>
							<Text size={0} muted style={{ textTransform: 'lowercase' }}>
								{displayUrl}
							</Text>
							<Text size={1} weight="bold" style={{
								display: '-webkit-box',
								WebkitLineClamp: 2,
								WebkitBoxOrient: 'vertical',
								overflow: 'hidden',
							}}>
								{title || 'Titolo della pagina'}
							</Text>
							{description && (
								<Text size={1} muted style={{
									display: '-webkit-box',
									WebkitLineClamp: 2,
									WebkitBoxOrient: 'vertical',
									overflow: 'hidden',
								}}>
									{description}
								</Text>
							)}
						</Stack>
					</Box>
				</Card>

				<Text size={0} muted>
					L&apos;aspetto finale potrebbe variare leggermente a seconda della piattaforma (X, Facebook, LinkedIn, WhatsApp).
				</Text>
			</Stack>
		</Card>
	)
}
