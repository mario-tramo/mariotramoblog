// import { GoogleTagManager } from '@next/third-parties/google'
import type { Metadata } from 'next'
import Root from '@/ui/Root'
import { getSite } from '@/sanity/lib/queries'
import { websiteJsonLd } from '@/lib/jsonLd'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import SkipToContent from '@/ui/SkipToContent'
import Announcement from '@/ui/Announcement'
import Header from '@/ui/header'
import Footer from '@/ui/footer'
import CookieBanner from '@/ui/CookieBanner'
import VisualEditingControls from '@/ui/VisualEditingControls'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import '@/styles/app.css'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL!

export const metadata: Metadata = {
	metadataBase: new URL(BASE_URL),
	title: {
		template: '%s | Mario Tramo',
		default: 'Mario Tramo',
	},
	description: 'Blog di sport, calcio, tattiche e molto altro.',
	openGraph: {
		siteName: 'Mario Tramo',
		locale: 'it_IT',
		type: 'website',
	},
	twitter: { card: 'summary_large_image' },
	icons: {
		icon: '/favicon.ico',
		apple: '/apple-touch-icon.png',
	},
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
			<body className="bg-canvas text-ink antialiased">
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(websiteJsonLd(title)),
					}}
				/>
				<NuqsAdapter>
					<SkipToContent />
					<Announcement />
					<Header />
					<main id="main-content" role="main" tabIndex={-1}>
						{children}
					</main>
					<Footer />
					<CookieBanner />

					<VisualEditingControls />
				</NuqsAdapter>

				<Analytics />
				<SpeedInsights />
			</body>
		</Root>
	)
}
