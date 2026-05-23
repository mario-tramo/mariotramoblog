// import { GoogleTagManager } from '@next/third-parties/google'
import type { Metadata } from 'next'
import Root from '@/ui/layout/Root'
import { getSite } from '@/sanity/lib/queries'
import { websiteJsonLd } from '@/lib/jsonLd'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import SkipToContent from '@/ui/layout/SkipToContent'
import Announcement from '@/ui/layout/Announcement'
import Header from '@/ui/layout/header'
import Footer from '@/ui/layout/footer'
import CookieBanner from '@/ui/features/CookieBanner'
import { ToastProvider } from '@/ui/features/Toast'
import VisualEditingControls from '@/ui/dev/VisualEditingControls'
// import DevFontSwitcher from '@/ui/dev/DevFontSwitcher'
import DevColorSwitcher from '@/ui/dev/DevColorSwitcher'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { BASE_URL } from '@/lib/env'
import '@/styles/app.css'

export const metadata: Metadata = {
	metadataBase: new URL(BASE_URL),
	title: {
		template: '%s | Trm Sport',
		default: 'Trm Sport',
	},
	description: 'Blog di sport, calcio, tattiche e molto altro.',
	openGraph: {
		siteName: 'Trm Sport',
		locale: 'it_IT',
		type: 'website',
	},
	twitter: { card: 'summary_large_image' },
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
	const { title } = await getSite()

	return (
		<Root>
			{/* <GoogleTagManager gtmId="" /> */}
			<body className="flex min-h-svh flex-col bg-canvas text-ink antialiased">
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(websiteJsonLd(title)),
					}}
				/>
				<NuqsAdapter>
					<ToastProvider>
					<SkipToContent />
					<Announcement />
					<Header />
					<main id="main-content" role="main" tabIndex={-1} className="flex-1">
						{children}
					</main>
					<Footer />
					<CookieBanner />
					</ToastProvider>

					<VisualEditingControls />
					{process.env.NODE_ENV === 'development' && (
						<>
							<DevColorSwitcher />
						</>
					)}
				</NuqsAdapter>

				<Analytics />
				<SpeedInsights />
			</body>
		</Root>
	)
}
