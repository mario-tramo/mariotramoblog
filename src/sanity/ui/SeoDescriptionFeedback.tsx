import { type StringInputProps } from 'sanity'
import { Stack, Text } from '@sanity/ui'

export default function SeoDescriptionFeedback(props: StringInputProps) {
	const { value, renderDefault } = props

	let text: string
	let color: string

	if (!value?.trim()) {
		text = 'La descrizione SEO e vuota. Senza di essa, Google mostrera un estratto automatico della pagina (spesso poco efficace).'
		color = '#f03e2f'
	} else {
		const len = value.trim().length
		if (len < 100) {
			text = `La descrizione e troppo corta (${len} caratteri). Hai spazio fino a 160 caratteri: sfruttalo per invogliare al click!`
			color = '#f5a623'
		} else if (len > 160) {
			text = `La descrizione e troppo lunga (${len} caratteri). Google la tagliera nei risultati. Resta sotto i 160 caratteri.`
			color = '#f03e2f'
		} else {
			text = `Perfetto! La lunghezza della descrizione (${len} caratteri) e ideale per i risultati di ricerca.`
			color = '#43a047'
		}
	}

	return (
		<Stack space={3}>
			{renderDefault(props)}
			<div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
				<div
					style={{
						width: 10,
						height: 10,
						minWidth: 10,
						borderRadius: '50%',
						backgroundColor: color,
						marginTop: 4,
					}}
				/>
				<Text size={1} muted>
					{text}
				</Text>
			</div>
		</Stack>
	)
}
