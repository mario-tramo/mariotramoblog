import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
	const pathname = request.nextUrl.pathname
	const response = NextResponse.next()
	response.headers.set('x-pathname', pathname)

	// Keep public URLs and their ISR cache entries free from draftMode(). When
	// Sanity Presentation enables Draft Mode, render the same URL through the
	// dedicated dynamic preview tree instead. The preview layout restores the
	// original request path for links/navigation and uses draft perspective.
	if (!pathname.startsWith('/preview-internal') && !pathname.startsWith('/filters-internal')) {
		if (request.cookies.has('__prerender_bypass')) {
			const previewUrl = request.nextUrl.clone()
			previewUrl.pathname = pathname === '/' ? '/preview-internal' : `/preview-internal${pathname}`
			const requestHeaders = new Headers(request.headers)
			requestHeaders.set('x-freebuff-internal-route', 'preview')
			return NextResponse.rewrite(previewUrl, {
				request: { headers: requestHeaders },
			})
		}

		// Query-string filters are request-specific. Keep the canonical page
		// route free of `searchParams` so its no-query variant can be ISR/
		// CDN-cached, and dispatch only filtered requests to the dynamic route.
		if (request.nextUrl.searchParams.size > 0) {
			const filtersUrl = request.nextUrl.clone()
			filtersUrl.pathname = pathname === '/' ? '/filters-internal' : `/filters-internal${pathname}`
			const requestHeaders = new Headers(request.headers)
			requestHeaders.set('x-freebuff-internal-route', 'filters')
			return NextResponse.rewrite(filtersUrl, {
				request: { headers: requestHeaders },
			})
		}
	}

	return response
}

export const config = {
	matcher: ['/((?!api|_next/static|_next/image|admin|favicon.ico).*)'],
}
