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
			description: 'Reindirizza da',
			placeholder: 'es. /vecchio-percorso, /vecchio-blog/:slug',
			type: 'string',
			validation: (Rule) => Rule.required().regex(regex),
		}),
		defineField({
			name: 'destination',
			title: 'Destinazione',
			description: 'Reindirizza a',
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
						Se <code>true</code> utilizzerà il codice di stato 308 che indica
						ai client/motori di ricerca di memorizzare il redirect per sempre, se{' '}
						<code>false</code> utilizzerà il codice di stato 307 che è temporaneo
						e non viene memorizzato nella cache.
					</p>
					<p>
						<a
							href="https://nextjs.org/docs/app/api-reference/next-config-js/redirects"
							target="_blank"
						>
							Documentazione redirect Next.js
						</a>
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
