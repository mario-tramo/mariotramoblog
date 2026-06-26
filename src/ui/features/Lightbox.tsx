'use client'

import { useState, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

type LightboxImage = {
	src: string
	alt: string
	caption?: string
}

export function useLightbox() {
	const [open, setOpen] = useState(false)
	const [image, setImage] = useState<LightboxImage | null>(null)

	const openLightbox = useCallback((img: LightboxImage) => {
		setImage(img)
		setOpen(true)
	}, [])

	const closeLightbox = useCallback(() => {
		setOpen(false)
		setTimeout(() => setImage(null), 200)
	}, [])

	useEffect(() => {
		if (!open) return
		function onKey(e: KeyboardEvent) {
			if (e.key === 'Escape') closeLightbox()
		}
		document.addEventListener('keydown', onKey)
		document.body.style.overflow = 'hidden'
		return () => {
			document.removeEventListener('keydown', onKey)
			document.body.style.overflow = ''
		}
	}, [open, closeLightbox])

	return { open, image, openLightbox, closeLightbox }
}

export default function Lightbox({
	image,
	onClose,
}: {
	image: LightboxImage
	onClose: () => void
}) {
	return createPortal(
		<div
			className="fixed inset-0 z-[100] flex items-center justify-center bg-canvas/95 backdrop-blur-md p-4 animate-in fade-in duration-300"
			onClick={onClose}
			role="dialog"
			aria-modal="true"
			aria-label="Anteprima immagine"
		>
			<button
				onClick={onClose}
				className="absolute top-4 right-4 z-10 flex size-10 items-center justify-center rounded-full bg-ink/10 text-ink/60 hover:bg-ink/20 hover:text-ink transition-colors"
				aria-label="Chiudi"
			>
				<X className="size-5" />
			</button>

			<figure
				className="relative max-h-full max-w-full"
				onClick={(e) => e.stopPropagation()}
			>
				<img
					src={image.src}
					alt={image.alt}
					className="max-h-[85vh] w-auto max-w-full rounded-lg object-contain shadow-2xl"
				/>
				{image.caption && (
					<figcaption className="mt-3 text-center text-sm text-muted italic">
						{image.caption}
					</figcaption>
				)}
			</figure>
		</div>,
		document.body,
	)
}
