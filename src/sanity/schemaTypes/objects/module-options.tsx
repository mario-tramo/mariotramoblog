'use client'

import { useState } from 'react'
import { defineField, defineType } from 'sanity'
import { Box, Button, Flex, Text, TextInput } from '@sanity/ui'
import { VscCheck, VscCopy } from 'react-icons/vsc'

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
					const moduleKey = (path[indexOfModule + 1] as any)?._key
					const [checked, setChecked] = useState(false)

					return (
						<Flex align="center" gap={1}>
							<Text muted>#</Text>

							<Box flex={1}>
								<TextInput {...elementProps as any} placeholder={moduleKey} />
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
	],
})
