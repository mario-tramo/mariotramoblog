function requireEnv(key: string, value: string | undefined): string {
	if (!value) {
		throw new Error(`Missing required environment variable: ${key}`)
	}
	return value
}

export const projectId = requireEnv(
	'NEXT_PUBLIC_SANITY_PROJECT_ID',
	process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
)
export const dataset = requireEnv(
	'NEXT_PUBLIC_SANITY_DATASET',
	process.env.NEXT_PUBLIC_SANITY_DATASET,
)

export const apiVersion = requireEnv(
	'NEXT_PUBLIC_SANITY_API_VERSION',
	process.env.NEXT_PUBLIC_SANITY_API_VERSION,
)
