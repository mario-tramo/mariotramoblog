'use client'

import { tabbedContentStore } from './store'

export default function Wrapper({
	index,
	...props
}: { index: number } & React.ComponentProps<'article'>) {
	const { active } = tabbedContentStore()

	return (
		<article
			{...props}
			hidden={index !== active}
			role="tabpanel"
			id={`tabpanel-${index}`}
			aria-labelledby={`tab-${index}`}
		/>
	)
}
