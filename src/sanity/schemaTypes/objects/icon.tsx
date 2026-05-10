import { defineField, defineType } from 'sanity'
import {
	getPreset,
	TextInputWithPresets,
	type Preset,
} from '@/sanity/ui/TextInputWithPresets'
import { VscSymbolMisc } from 'react-icons/vsc'

const ic0nPresets: Preset[] =
	'ai,bi,bs,cg,ci,di,fa,fa6,fc,fi,gi,go,gr,hi,hi2,im,io,io5,lia,lu,md,pi,ri,rx,si,sl,tb,tfi,ti,vsc,wi'
		.split(',')
		.map((p) => ({
			title: p,
			value: `${p}/`,
		}))

const sizePresets = ['2.5rem', '80px', '1.5lh']

export default defineType({
	name: 'icon',
	title: 'Icona',
	icon: VscSymbolMisc,
	type: 'object',
	options: {
		columns: 2,
	},
	fields: [
		defineField({
			name: 'image',
			title: 'Immagine',
			type: 'image',
			description: 'Immagine personalizzata da usare come icona',
			options: {
				hotspot: true,
			},
		}),
		defineField({
			name: 'ic0n',
			title: 'Icona da libreria',
			description: (
				<span>
					Codice icona dalla libreria{' '}
					<a href="https://react-icons.github.io/react-icons/" target="_blank">react-icons</a>.
					{' '}Formato: <code>libreria/NomeIcona</code> (es. <code>fa6/FaFacebook</code>)
				</span>
			),
			type: 'string',
			placeholder: 'es. fa6/FaFacebook, vsc/VscHome',
			validation: (Rule) => Rule.regex(/[a-z0-9]{2,3}\/([a-zA-Z0-9]+)/),
			components: {
				input: (props) => (
					<TextInputWithPresets
						prefix="ic0n.dev/"
						presets={ic0nPresets}
						{...(props as any)}
					/>
				),
			},
		}),
		defineField({
			name: 'size',
			title: 'Dimensione',
			type: 'string',
			description: "Dimensione dell'icona in CSS (es. 2.5rem = ~40px, 80px)",
			placeholder: `es. ${sizePresets.map((p) => getPreset(p)).join(', ')}`,
			initialValue: sizePresets[0],
			components: {
				input: (props) => (
					<TextInputWithPresets presets={sizePresets} {...(props as any)} />
				),
			},
		}),
	],
	preview: {
		select: {
			image: 'image',
			ic0n: 'ic0n',
			size: 'size',
		},
		prepare: ({ image, ic0n, size }) => ({
			title: ic0n,
			subtitle: size,
			media: ic0n ? <img src={`https://ic0n.dev/${ic0n}`} /> : image,
		}),
	},
})
