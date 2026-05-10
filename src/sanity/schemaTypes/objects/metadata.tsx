import { defineField, defineType } from 'sanity'
import { CharacterCount } from '@/sanity/ui/CharacterCount'
import PreviewOG from '@/sanity/ui/PreviewOG'
import SocialPreview from '@/sanity/ui/SocialPreview'

export default defineType({
	name: 'metadata',
	title: 'Metadati SEO',
	description: 'Informazioni per i motori di ricerca e le anteprime social',
	type: 'object',
	fields: [
		defineField({
			name: 'slug',
			title: 'Percorso URL',
			type: 'slug',
			description: 'Indirizzo della pagina sul sito (es. /chi-siamo). Clicca "Genera" per crearlo automaticamente dal titolo.',
			options: {
				source: (doc: any) => doc.title || doc.metadata.title,
			},
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'title',
			title: 'Titolo SEO',
			type: 'string',
			description: 'Titolo mostrato nei risultati di ricerca (max 60 caratteri consigliati)',
			validation: (Rule) => Rule.max(60).warning(),
			components: {
				input: (props) => (
					<CharacterCount max={60} {...(props as any)}>
						<PreviewOG title={props.elementProps.value} />
					</CharacterCount>
				),
			},
		}),
		defineField({
			name: 'description',
			title: 'Descrizione',
			type: 'text',
			description: 'Breve descrizione mostrata nei risultati di ricerca (max 160 caratteri consigliati)',
			validation: (Rule) => Rule.max(160).warning(),
			components: {
				input: (props) => (
					<CharacterCount as="textarea" max={160} {...(props as any)} />
				),
			},
		}),
		defineField({
			name: 'image',
			title: 'Immagine di condivisione',
			description: 'Immagine mostrata quando condividi il link su WhatsApp, Facebook, Twitter ecc. Dimensione consigliata: 1200x630px.',
			type: 'image',
			options: {
				hotspot: true,
				metadata: ['lqip'],
			},
		}),
		defineField({
			name: 'noIndex',
			title: 'Nascondi dai motori di ricerca',
			description: 'Se attivo, Google e altri motori di ricerca non indicizzeranno questa pagina. Usalo per pagine private o in costruzione.',
			type: 'boolean',
			initialValue: false,
		}),
		defineField({
			name: 'socialPreview',
			title: 'Anteprima social',
			type: 'string',
			components: {
				field: () => <SocialPreview />,
			},
		}),
	],
})
