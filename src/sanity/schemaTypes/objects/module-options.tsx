'use client'

import { useState } from 'react'
import { defineField, defineType } from 'sanity'
import { Box, Button, Flex, Text, TextInput } from '@sanity/ui'
import { VscCheck, VscCopy } from 'react-icons/vsc'

const BACKGROUND_OPTIONS = [
	{ title: 'Nessuno', value: 'none' },
	{ title: 'Superficie (cards)', value: 'surface' },
	{ title: 'Soft (respiro)', value: 'soft' },
	{ title: 'Contrasto (quasi nero)', value: 'contrast' },
	{ title: 'Accento', value: 'accent' },
	{ title: 'Scuro', value: 'dark' },
	{ title: 'Personalizzato', value: 'custom' },
]

export default defineType({
	name: 'module-options',
	title: 'Opzioni modulo',
	type: 'object',
	fields: [
		defineField({
			name: 'hidden',
			title: 'Nascondi modulo',
			type: 'boolean',
			description: 'Se attivo, questo modulo non sarà visibile sul sito (utile per nasconderlo temporaneamente)',
			initialValue: false,
		}),
		defineField({
			name: 'uid',
			title: 'Identificativo sezione',
			description: 'Permette di creare link diretti a questa sezione (es. /pagina#identificativo). Solo lettere, numeri e trattini.',
			type: 'string',
			validation: (Rule) =>
				Rule.regex(/^[a-zA-Z0-9-]+$/g).error(
					'Non deve contenere spazi o caratteri speciali',
				),
			components: {
				input: ({ elementProps, path }) => {
					const indexOfModule = path.indexOf('modules')
					const moduleKey = (path[indexOfModule + 1] as { _key?: string })?._key
					const [checked, setChecked] = useState(false)

					return (
						<Flex align="center" gap={1}>
							<Text muted>#</Text>

							<Box flex={1}>
								<TextInput {...(elementProps as unknown as React.ComponentProps<typeof TextInput>)} placeholder={moduleKey} />
							</Box>

							<Button
								title="Clicca per copiare"
								mode="ghost"
								icon={checked ? VscCheck : VscCopy}
								disabled={checked}
								onClick={() => {
									navigator.clipboard.writeText(
										'#' + (elementProps.value || moduleKey),
									)

									setChecked(true)
									setTimeout(() => setChecked(false), 1000)
								}}
							/>
						</Flex>
					)
				},
			},
		}),
		defineField({
			name: 'background',
			title: 'Sfondo sezione',
			type: 'string',
			options: {
				list: BACKGROUND_OPTIONS,
				layout: 'radio',
			},
			initialValue: 'none',
		}),
		defineField({
			name: 'customBgColor',
			title: 'Colore personalizzato',
			type: 'string',
			description: 'Codice colore HEX (es. #1a1a2e)',
			hidden: ({ parent }) => parent?.background !== 'custom',
		}),
		defineField({
			name: 'fullBleed',
			title: 'Sfondo a tutta larghezza',
			type: 'boolean',
			description: 'Estende lo sfondo ai bordi dello schermo',
			initialValue: false,
			hidden: ({ parent }) => !parent?.background || parent?.background === 'none',
		}),
	],
})
