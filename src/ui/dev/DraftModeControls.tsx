'use client'

import { FlaskConicalOff } from 'lucide-react'

export default function DraftModeControls() {
	return (
		<details className="frosted-glass fixed right-4 bottom-0 rounded-t bg-amber-200/90 text-xs shadow-xl not-hover:opacity-50 open:opacity-100">
			<summary className="p-2">Draft Mode</summary>

			<menu className="anim-fade-to-r p-2 pt-0">
				<li>
					<a
						className="inline-flex items-center gap-1 py-0.5 hover:underline"
						href="/api/draft-mode/disable"
					>
						<FlaskConicalOff className="size-3.5 shrink-0" />
						Disable Draft Mode
					</a>
				</li>
			</menu>
		</details>
	)
}
