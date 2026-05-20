import type { DocumentBadgeComponent } from 'sanity'

export const ScheduledBadge: DocumentBadgeComponent = ({ draft }) => {
	const publishAt = (draft as Record<string, unknown> | null)?.publishAt as
		| string
		| undefined

	if (!publishAt) return null

	const scheduledDate = new Date(publishAt)
	const now = new Date()
	const isOverdue = scheduledDate <= now

	if (isOverdue) {
		return {
			label: 'In ritardo',
			title: 'La data programmata è passata',
			color: 'danger',
		}
	}

	const formatted = scheduledDate.toLocaleString('it-IT', {
		day: '2-digit',
		month: 'short',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	})

	return {
		label: 'Programmato',
		title: `Pubblicazione: ${formatted}`,
		color: 'warning',
	}
}
