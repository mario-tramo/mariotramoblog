import { AsyncLocalStorage } from 'node:async_hooks'

const previewStorage = new AsyncLocalStorage<boolean>()

export function runInPreview<T>(callback: () => T): T {
	return previewStorage.run(true, callback)
}

export function isPreviewRender(): boolean {
	return previewStorage.getStore() === true
}
