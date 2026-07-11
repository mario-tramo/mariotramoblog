import * as Sentry from '@sentry/nextjs'

export function register() {
	Sentry.init({
		dsn: process.env.SENTRY_DSN,
		environment: process.env.NODE_ENV,
		tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
	})
}

export const onRequestError = Sentry.captureRequestError
