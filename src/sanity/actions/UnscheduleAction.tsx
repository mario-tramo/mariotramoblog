'use client'

import { useState, useCallback } from 'react'
import { useDocumentOperation, type DocumentActionComponent } from 'sanity'
import { CloseCircleIcon } from '@sanity/icons'
import { Box, Button, Card, Flex, Stack, Text } from '@sanity/ui'

export const UnscheduleAction: DocumentActionComponent = (props) => {
	const { id, type, draft, published } = props
	const { patch } = useDocumentOperation(id, type)

	const doc = (draft || published) as Record<string, unknown> | null
	const publishAt = doc?.publishAt as string | undefined

	const [isOpen, setIsOpen] = useState(false)

	const handleUnschedule = useCallback(() => {
		patch.execute([{ unset: ['publishAt'] }])
		setIsOpen(false)
		props.onComplete()
	}, [patch, props])

	if (!publishAt) return null

	const formatted = new Date(publishAt).toLocaleString('it-IT', {
		day: '2-digit',
		month: 'long',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	})

	return {
		label: 'Annulla programmazione',
		icon: CloseCircleIcon,
		tone: 'critical',
		onHandle: () => setIsOpen(true),
		dialog: isOpen
			? {
					type: 'dialog' as const,
					header: 'Annulla programmazione',
					onClose: () => {
						setIsOpen(false)
						props.onComplete()
					},
					content: (
						<Box padding={4}>
							<Stack space={4}>
								<Card padding={3} radius={2} tone="caution">
									<Text size={1} align="center">
										Pubblicazione prevista per il {formatted}
									</Text>
								</Card>

								<Text size={1} muted align="center">
									Vuoi rimuovere la programmazione? Il documento
									resterà come bozza.
								</Text>

								<Flex gap={3} justify="flex-end">
									<Button
										text="Torna indietro"
										mode="ghost"
										onClick={() => {
											setIsOpen(false)
											props.onComplete()
										}}
									/>
									<Button
										text="Rimuovi programmazione"
										tone="critical"
										onClick={handleUnschedule}
									/>
								</Flex>
							</Stack>
						</Box>
					),
				}
			: null,
	}
}
