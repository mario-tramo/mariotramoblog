// import { GoogleTagManager } from '@next/third-parties/google'
import Root from '@/ui/Root'
import { getSite } from '@/sanity/lib/queries'
import { websiteJsonLd } from '@/lib/jsonLd'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import SkipToContent from '@/ui/SkipToContent'
import Announcement from '@/ui/Announcement'
import Header from '@/ui/header'
import Footer from '@/ui/footer'
import VisualEditingControls from '@/ui/VisualEditingControls'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import '@/styles/app.css'

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

					<VisualEditingControls />
				</NuqsAdapter>

				<Analytics />
				<SpeedInsights />
			</body>
		</Root>
	)
}
