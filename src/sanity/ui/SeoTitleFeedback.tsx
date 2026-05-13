import { type StringInputProps, useFormValue } from 'sanity'
import { Stack, Text } from '@sanity/ui'

function FeedbackDot({ color, text }: { color: string; text: string }) {
	return (
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
	)
}

export default function SeoTitleFeedback(props: StringInputProps) {
	const { value, renderDefault, path } = props

	const parentPath = path.slice(0, -1)
	const parent = useFormValue(parentPath) as { seoKeywords?: string[] } | undefined
	const keywords = parent?.seoKeywords || []

	const feedback: { text: string; color: string }[] = []

	if (!value?.trim()) {
		feedback.push({
			text: 'Il titolo SEO e vuoto. Scrivine uno per migliorare il posizionamento su Google.',
			color: '#f03e2f',
		})
	} else {
		const len = value.length
		if (len < 50) {
			feedback.push({
				text: `Il titolo e troppo corto (${len} caratteri). Cerca di arrivare almeno a 50 per sfruttare tutto lo spazio su Google.`,
				color: '#f5a623',
			})
		} else if (len > 60) {
			feedback.push({
				text: `Il titolo e troppo lungo (${len} caratteri). Google potrebbe tagliarlo. Resta sotto i 60 caratteri.`,
				color: '#f03e2f',
			})
		} else {
			feedback.push({
				text: `Ottimo! La lunghezza del titolo (${len} caratteri) e perfetta per Google.`,
				color: '#43a047',
			})
		}

		if (keywords.length > 0) {
			const found = keywords.some((kw) =>
				value.toLowerCase().includes(kw.toLowerCase()),
			)
			if (found) {
				feedback.push({
					text: 'La parola chiave e presente nel titolo. Bene!',
					color: '#43a047',
				})
			} else {
				feedback.push({
					text: 'Nessuna delle parole chiave e presente nel titolo. Prova a inserirne almeno una.',
					color: '#f03e2f',
				})
			}
		} else {
			feedback.push({
				text: 'Non hai ancora inserito parole chiave. Aggiungine alcune nel campo "Parole chiave" qui sotto.',
				color: '#f5a623',
			})
		}
	}

	return (
		<Stack space={3}>
			{renderDefault(props)}
			<Stack space={2}>
				{feedback.map((item) => (
					<FeedbackDot key={item.text} color={item.color} text={item.text} />
				))}
			</Stack>
		</Stack>
	)
}
