import { useEffect, useRef } from 'react'

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function useFocusTrap<T extends HTMLElement>(active: boolean) {
	const ref = useRef<T>(null)
	const previousFocus = useRef<HTMLElement | null>(null)

	useEffect(() => {
		if (!active || !ref.current) return

		previousFocus.current = document.activeElement as HTMLElement

		const container = ref.current
		const firstFocusable = container.querySelector<HTMLElement>(FOCUSABLE)
		firstFocusable?.focus()

		function handleKeyDown(e: KeyboardEvent) {
			if (e.key !== 'Tab') return

			const focusable = container.querySelectorAll<HTMLElement>(FOCUSABLE)
			if (!focusable.length) return

			const first = focusable[0]
			const last = focusable[focusable.length - 1]

			if (e.shiftKey && document.activeElement === first) {
				e.preventDefault()
				last.focus()
			} else if (!e.shiftKey && document.activeElement === last) {
				e.preventDefault()
				first.focus()
			}
		}

		document.addEventListener('keydown', handleKeyDown)
		return () => {
			document.removeEventListener('keydown', handleKeyDown)
			previousFocus.current?.focus()
		}
	}, [active])

	return ref
}
