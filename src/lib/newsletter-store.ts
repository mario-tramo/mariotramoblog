type Subscriber = {
	email: string
	subscribedAt: string
}

declare global {
	var newsletterSubscribers: Map<string, Subscriber> | undefined
}

const subscribers =
	globalThis.newsletterSubscribers ?? new Map<string, Subscriber>()

if (!globalThis.newsletterSubscribers) {
	globalThis.newsletterSubscribers = subscribers
	if (process.env.NODE_ENV !== 'production') {
		console.warn(
			'[newsletter-store] Using in-memory store. Data is lost on server restart. Add a database for production.',
		)
	}
}

export function addSubscriber(email: string) {
	const normalized = email.trim().toLowerCase()

	if (subscribers.has(normalized)) {
		return {
			alreadyExists: true,
			subscriber: subscribers.get(normalized)!,
		}
	}

	const subscriber = {
		email: normalized,
		subscribedAt: new Date().toISOString(),
	}

	subscribers.set(normalized, subscriber)

	return {
		alreadyExists: false,
		subscriber,
	}
}

export function getAllSubscribers() {
	return Array.from(subscribers.values())
}

export function getSubscriberCount() {
	return subscribers.size
}
