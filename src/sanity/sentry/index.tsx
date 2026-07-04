'use client'

import { definePlugin, useCurrentUser } from 'sanity'
import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'

function SentryUserTracker() {
	const user = useCurrentUser()

	useEffect(() => {
		if (user?.id) {
			Sentry.setUser({
				id: user.id,
				email: user.email ?? undefined,
			})
		}
	}, [user])

	return null
}

export const sentryPlugin = definePlugin({
	name: 'sentry',
	studio: {
		components: {
			layout: (props) => (
				<>
					<SentryUserTracker />
					{props.renderDefault(props)}
				</>
			),
		},
	},
})
