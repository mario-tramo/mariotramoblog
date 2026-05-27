'use client'

import { createContext, useCallback, useContext, useState } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Toast {
	id: number
	message: string
}

const ToastContext = createContext<(message: string) => void>(() => { })

export function useToast() {
	return useContext(ToastContext)
}

let nextId = 0

export function ToastProvider({ children }: { children: React.ReactNode }) {
	const [toasts, setToasts] = useState<Toast[]>([])

	const show = useCallback((message: string) => {
		const id = nextId++
		setToasts((prev) => [...prev, { id, message }])
		setTimeout(() => {
			setToasts((prev) => prev.filter((t) => t.id !== id))
		}, 2000)
	}, [])

	return (
		<ToastContext value={show}>
			{children}

			<div className="fixed bottom-6 left-1/2 z-[100] flex -translate-x-1/2 flex-col items-center gap-2">
				{toasts.map((toast) => (
					<div
						key={toast.id}
						className={cn(
							'flex items-center gap-2 rounded-full border border-line bg-surface-light px-4 py-2 text-sm font-medium text-ink shadow-xl shadow-black/30 backdrop-blur-xl',
							'animate-in fade-in slide-in-from-bottom-2 duration-200',
						)}
					>
						<Check className="size-4 text-brand" />
						{toast.message}
					</div>
				))}
			</div>
		</ToastContext>
	)
}
