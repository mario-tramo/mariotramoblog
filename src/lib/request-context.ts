import { AsyncLocalStorage } from 'node:async_hooks'

export type RequestSearchParams = Record<string, string | string[] | undefined>

const searchParamsStorage = new AsyncLocalStorage<RequestSearchParams>()

export function runWithSearchParams<T>(
	searchParams: RequestSearchParams,
	callback: () => T,
): T {
	return searchParamsStorage.run(searchParams, callback)
}

export function getRequestSearchParams(): RequestSearchParams {
	return searchParamsStorage.getStore() ?? {}
}
