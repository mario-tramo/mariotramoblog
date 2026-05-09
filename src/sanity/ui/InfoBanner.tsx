'use client'

import { Box, Card, Flex, Heading, Stack, Text } from '@sanity/ui'
import { VscLightbulb } from 'react-icons/vsc'

export default function InfoBanner(props: {
	options?: Record<string, unknown>
}) {
	const title = props.options?.title as string
	const description = props.options?.description as string
	const example = props.options?.example as string | undefined

	return (
		<Box padding={4}>
			<Stack space={4}>
				<Card padding={4} radius={3} tone="primary" border>
					<Stack space={4}>
						<Heading size={1}>{title}</Heading>
						<Text size={1} style={{ lineHeight: 1.6 }}>
							{description}
						</Text>
					</Stack>
				</Card>

				{example && (
					<Card padding={4} radius={3} tone="transparent" border>
						<Stack space={3}>
							<Flex align="center" gap={2}>
								<Text size={1}>
									<VscLightbulb />
								</Text>
								<Text size={1} weight="bold">
									Esempio
								</Text>
							</Flex>
							<Text size={1} muted style={{ lineHeight: 1.6 }}>
								{example}
							</Text>
						</Stack>
					</Card>
				)}
			</Stack>
		</Box>
	)
}
