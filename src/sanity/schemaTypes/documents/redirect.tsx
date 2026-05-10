import { defineField, defineType } from 'sanity'
import { PiFlowArrow } from 'react-icons/pi'
import resolveSlug from '@/sanity/lib/resolveSlug'

const regex = /^(\/|https?:\/\/)/

export default defineType({
	name: 'redirect',
	title: 'Redirect',
	icon: PiFlowArrow,
	type: 'document',
	fields: [
		defineField({
			name: 'source',
			title: 'Origine',
			description: 'Percorso da cui reindirizzare (es. /vecchio-percorso). Deve iniziare con / oppure http',
			placeholder: 'es. /vecchio-percorso, /vecchio-blog/:slug',
			type: 'string',
			validation: (Rule) => Rule.required().regex(regex).error('Deve iniziare con / oppure http'),
		}),
		defineField({
			name: 'destination',
			title: 'Destinazione',
			description: 'Pagina o URL verso cui reindirizzare',
			type: 'link',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'permanent',
			title: 'Permanente',
			type: 'boolean',
			initialValue: true,
			description: (
				<>
					<p>
						<strong>Attivo (consigliato)</strong>: redirect permanente (308). I motori di ricerca
						aggiornano i loro indici e i browser lo memorizzano.
					</p>
					<p>
						<strong>Disattivo</strong>: redirect temporaneo (307). Non viene memorizzato.
						Usalo solo se il vecchio URL tornerà attivo in futuro.
					</p>
				</>
			),
		}),
	],
	preview: {
		select: {
			title: 'source',
			_type: 'destination.internal._type',
			internal: 'destination.internal.metadata.slug.current',
			params: 'destination.params',
			external: 'destination.external',
		},
		prepare: ({ title, _type, internal, params, external }) => ({
			title,
			subtitle:
				(external || internal) &&
				`to ${external || resolveSlug({ _type, internal, params })}`,
		}),
	},
})
