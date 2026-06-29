import { Inter, Bebas_Neue } from 'next/font/google'
import type { ComponentProps } from 'react'

const inter = Inter({
	subsets: ['latin'],
	variable: '--font-inter',
	display: 'swap',
})

const bebasNeue = Bebas_Neue({
	weight: '400',
	subsets: ['latin'],
	variable: '--font-bebas-neue',
	display: 'swap',
})

export default function Root(props: ComponentProps<'html'>) {
	return (
		<html
			lang="it"
			className={`${inter.variable} ${bebasNeue.variable}`}
			{...props}
		/>
	)
}
