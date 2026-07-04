import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import Root from '@/ui/layout/Root'
import JsonLd from '@/ui/primitives/JsonLd'
import { getSite } from '@/sanity/lib/queries'
import { urlFor } from '@/sanity/lib/image'
import { websiteJsonLd } from '@/lib/jsonLd'
import { Suspense } from 'react'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import SkipToContent from '@/ui/layout/SkipToContent'
import ScrollToTop from '@/ui/layout/FocusOnNavigate'
import Header from '@/ui/layout/header'
import Footer from '@/ui/layout/footer'
import { CookieConsentProvider } from '@/ui/features/CookieConsent'
import CookieBanner from '@/ui/features/CookieBanner'
import ConsentAnalytics from '@/ui/features/ConsentAnalytics'
import { ToastProvider } from '@/ui/features/Toast'
import { BASE_URL } from '@/lib/env'
import DevColorSwitcher from '@/ui/dev/DevColorSwitcher'
import '@/styles/app.css'

const Announcement = dynamic(() => import('@/ui/layout/Announcement'))
const NavigationLoadingBar = dynamic(() => import('@/ui/layout/NavigationLoadingBar'))
const VisualEditingControls = dynamic(() => import('@/ui/dev/VisualEditingControls'))

export const viewport = {
	themeColor: '#07111F',
}

export const metadata: Metadata = {
	metadataBase: new URL(BASE_URL),
	title: {
		template: '%s | TRM Sport',
		default: 'TRM Sport',
	},
	description: 'Blog di sport, calcio, tattiche e molto altro.',
	openGraph: {
		siteName: 'TRM Sport',
		locale: 'it_IT',
		type: 'website',
	},
	twitter: { card: 'summary_large_image', site: '@TRMSPORT', creator: '@TRMSPORT' },
	icons: {
		icon: [
			{ url: '/favicon.ico', sizes: '16x16 32x32' },
			{ url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
			{ url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
			{ url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
			{ url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
		],
		apple: '/apple-touch-icon.png',
	},
	manifest: '/site.webmanifest',
	verification: {
		google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
	},
}

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	const { title, logo } = await getSite()
	const logoUrl = logo?.asset ? urlFor(logo).width(512).height(512).url() : undefined

	return (
		<Root>
			<link rel="preconnect" href="https://cdn.sanity.io" />
			<link rel="dns-prefetch" href="https://cdn.sanity.io" />
			<body className="flex min-h-svh flex-col bg-canvas text-ink antialiased">
				<JsonLd data={websiteJsonLd(title, undefined, logoUrl)} />
				<NuqsAdapter>
					<CookieConsentProvider>
					<ToastProvider>
					<SkipToContent />
					<ScrollToTop />
					<Suspense fallback={null}>
						<NavigationLoadingBar />
					</Suspense>
					<Announcement />
					<Header />
					<main id="main-content" tabIndex={-1} className="flex-1">
						{children}
					</main>
					<Footer />
					<CookieBanner />
					<ConsentAnalytics />
					</ToastProvider>
					</CookieConsentProvider>

					<VisualEditingControls />
					{process.env.NODE_ENV === 'development' && (
						<>
							<DevColorSwitcher />
						</>
					)}
				</NuqsAdapter>
			</body>
		</Root>
	)
}
