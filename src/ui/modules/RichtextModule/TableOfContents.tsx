'use client'

import { useEffect } from 'react'
import { slug } from '@/lib/utils'
import css from './TableOfContents.module.css'

export default function TableOfContents({
	headings,
}: {
	headings?: {
		text: string
		style: string
	}[]
}) {
	useEffect(() => {
		if (typeof document === 'undefined' || !headings?.length) return

		const headerHeight =
			document.querySelector('body > header')?.clientHeight || 0

		const targets = new Map<Element, string>()

		headings.forEach(({ text }) => {
			const id = slug(text)
			const el = document.getElementById(id)
			if (el) targets.set(el, id)
		})

		if (!targets.size) return

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					const id = targets.get(entry.target)
					if (!id) return
					const tocItem = document.querySelector(
						`[data-toc-item="${id}"]`,
					)
					if (entry.isIntersecting) {
						tocItem?.classList.add(css.inView)
					} else {
						tocItem?.classList.remove(css.inView)
					}
				})
			},
			{
				threshold: 1,
				rootMargin: `-${headerHeight}px 0px 0px 0px`,
			},
		)

		targets.forEach((_, el) => observer.observe(el))

		return () => observer.disconnect()
	}, [headings])

	return (
		<nav className={css.root}>
			<h3 className="text-base font-black uppercase tracking-wider text-brand">
				Indice dei contenuti
			</h3>

			<hr className="mt-3 border-line" />

			<ol className="mt-4 space-y-5">
				{headings?.map(({ text }, key) => (
					<li
						data-toc-item={slug(text)}
						key={key}
					>
						<a
							className="block text-[15px] font-medium text-ink/80 transition-colors hover:text-brand"
							href={`#${slug(text)}`}
						>
							{text}
						</a>
					</li>
				))}
			</ol>
		</nav>
	)
}
