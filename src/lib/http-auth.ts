import { safeEqual } from './crypto'

export interface AuthOptions {
	headerNames?: string[]
	queryParam?: string
}

export function isAuthorized(
	request: { headers: Map<string, string> | Headers; nextUrl?: { searchParams: URLSearchParams } },
	expectedSecret: string | null | undefined,
	options: AuthOptions = {},
): boolean {
	if (!expectedSecret) return false

	const headerNames = options.headerNames ?? ['authorization']
	const queryParam = options.queryParam

	if (queryParam && request.nextUrl) {
		const param = request.nextUrl.searchParams.get(queryParam)
		if (param && safeEqual(param, expectedSecret)) {
			return true
		}
	}

	for (const name of headerNames) {
		const header = getHeader(request.headers, name)
		if (!header) continue

		const bearer = header.replace(/^bearer\s+/i, '').trim()
		if (bearer && safeEqual(bearer, expectedSecret)) {
			return true
		}
	}

	return false
}

function getHeader(headers: Map<string, string> | Headers, name: string): string | null {
	if (headers instanceof Headers) {
		return headers.get(name)
	}
	return headers.get(name) ?? null
}
