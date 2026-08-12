'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

const SECTION_SELECTOR = '.section, [data-module]'
const ITEM_SELECTOR =
	'.section :is(article, [class*="grid"] > *), [data-module] :is(article, [class*="grid"] > *)'
const REVEAL_SELECTORS = [SECTION_SELECTOR, ITEM_SELECTOR]

export default function ScrollReveal() {
	const pathname = usePathname()

	useEffect(() => {
		const observed = new WeakSet<Element>()
		const pendingNodes = new Set<Node>()
		let scanFrame: number | null = null

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						entry.target.setAttribute('data-visible', 'true')
						observer.unobserve(entry.target)
					}
				}
			},
			{ rootMargin: '-64px 0px -64px 0px' },
		)

		const observe = (element: Element) => {
			if (observed.has(element)) return
			observed.add(element)
			observer.observe(element)
		}

		const observeTree = (node: Node) => {
			if (!(node instanceof Element)) return

			for (const selector of REVEAL_SELECTORS) {
				if (node.matches(selector)) observe(node)
				for (const element of node.querySelectorAll(selector)) {
					observe(element)
				}
			}
		}

		const scanFrameNodes = () => {
			scanFrame = null
			for (const node of pendingNodes) observeTree(node)
			pendingNodes.clear()
		}

		const scheduleScan = () => {
			if (scanFrame !== null) return
			scanFrame = window.requestAnimationFrame(scanFrameNodes)
		}

		const mutations = new MutationObserver((records) => {
			for (const record of records) {
				for (const node of record.addedNodes) pendingNodes.add(node)
			}
			if (pendingNodes.size > 0) scheduleScan()
		})

		mutations.observe(document.body, { childList: true, subtree: true })
		for (const selector of REVEAL_SELECTORS) {
			for (const element of document.querySelectorAll(selector)) observe(element)
		}

		return () => {
			mutations.disconnect()
			observer.disconnect()
			pendingNodes.clear()
			if (scanFrame !== null) window.cancelAnimationFrame(scanFrame)
		}
	}, [pathname])

	return null
}
