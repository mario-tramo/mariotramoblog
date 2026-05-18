'use client'

import getLang from '@/lib/getLang'
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
	const lang = getLang()

	return (
		<html
			lang={lang}
			className={`${inter.variable} ${bebasNeue.variable}`}
			{...props}
		/>
	)
}
