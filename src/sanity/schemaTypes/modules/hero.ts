import { defineField, defineType } from 'sanity'
import { TfiLayoutCtaCenter } from 'react-icons/tfi'
import { count } from '@/lib/utils'

export default defineType({
	name: 'hero',
	title: 'Hero',
	icon: TfiLayoutCtaCenter,
	type: 'object',
	fields: [
		defineField({
			name: 'options',
			title: 'Opzioni modulo',
			type: 'module-options',
			description: 'Impostazioni generali del modulo (visibilita, ancoraggio)',
		}),
		defineField({
			name: 'slides',
			title: 'Slides',
			type: 'array',
			description:
				'Una slide = hero statico. Più slides = carosello automatico.',
			of: [{ type: 'hero-slide' }],
			validation: (Rule) => Rule.min(1).required(),
		}),
	],
	preview: {
		select: {
			firstTitle: 'slides.0.title',
			media: 'slides.0.image',
			slides: 'slides',
		},
		prepare: ({ firstTitle, media, slides }) => ({
			title: firstTitle || 'Hero',
			subtitle:
				slides?.length > 1
					? `Carosello — ${count(slides, 'slide', 'slides')}`
					: 'Hero statico',
			media,
		}),
	},
})
