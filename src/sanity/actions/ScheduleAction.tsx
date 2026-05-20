'use client'

import { useState, useCallback } from 'react'
import { useDocumentOperation, type DocumentActionComponent } from 'sanity'
import { CalendarIcon } from '@sanity/icons'
import { Box, Button, Card, Flex, Stack, Text, TextInput } from '@sanity/ui'

export const ScheduleAction: DocumentActionComponent = (props) => {
	const { id, type, draft, published } = props
	const { patch } = useDocumentOperation(id, type)

	const doc = (draft || published) as Record<string, unknown> | null
	const currentPublishAt = doc?.publishAt as string | undefined

	const [isOpen, setIsOpen] = useState(false)
	const [date, setDate] = useState('')
	const [time, setTime] = useState('')

	const handleOpen = useCallback(() => {
		if (currentPublishAt) {
			const dt = new Date(currentPublishAt)
			setDate(dt.toISOString().slice(0, 10))
			setTime(
				dt.toLocaleTimeString('it-IT', {
					hour: '2-digit',
					minute: '2-digit',
					hour12: false,
				}),
			)
		} else {
			const tomorrow = new Date()
			tomorrow.setDate(tomorrow.getDate() + 1)
			tomorrow.setHours(9, 0, 0, 0)
			setDate(tomorrow.toISOString().slice(0, 10))
			setTime('09:00')
		}
		setIsOpen(true)
	}, [currentPublishAt])

	const handleSchedule = useCallback(() => {
		if (!date || !time) return
		const iso = new Date(`${date}T${time}:00`).toISOString()
		patch.execute([{ set: { publishAt: iso } }])
		setIsOpen(false)
		props.onComplete()
	}, [date, time, patch, props])

	const isValid = date && time && new Date(`${date}T${time}:00`) > new Date()

	return {
		label: currentPublishAt
			? 'Modifica pubblicazione programmata'
			: 'Programma pubblicazione',
		icon: CalendarIcon,
		tone: currentPublishAt ? 'caution' : 'primary',
		onHandle: handleOpen,
		dialog: isOpen
			? {
					type: 'dialog' as const,
					header: 'Programma pubblicazione',
					onClose: () => setIsOpen(false),
					content: (
						<Box padding={4}>
							<Stack space={4}>
								<Stack space={2}>
									<Text size={1} weight="bold">
										Data
									</Text>
									<TextInput
										type="date"
										value={date}
										onChange={(e) => setDate(e.currentTarget.value)}
									/>
								</Stack>

								<Stack space={2}>
									<Text size={1} weight="bold">
										Ora
									</Text>
									<TextInput
										type="time"
										value={time}
										onChange={(e) => setTime(e.currentTarget.value)}
									/>
								</Stack>

								<Text size={1} muted align="center">
									Usa questa azione come unico punto di programmazione.
								</Text>

								{date && time && (
									<Card
										padding={3}
										radius={2}
										tone={isValid ? 'positive' : 'critical'}
									>
										<Text size={1} align="center">
											{isValid
												? `Sarà pubblicato il ${new Date(`${date}T${time}:00`).toLocaleString('it-IT', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`
												: 'La data deve essere nel futuro'}
										</Text>
									</Card>
								)}

								<Flex gap={3} justify="flex-end">
									<Button
										text="Annulla"
										mode="ghost"
										onClick={() => {
											setIsOpen(false)
											props.onComplete()
										}}
									/>
									<Button
										text="Conferma"
										tone="positive"
										disabled={!isValid}
										onClick={handleSchedule}
									/>
								</Flex>
							</Stack>
						</Box>
					),
				}
			: null,
	}
}
