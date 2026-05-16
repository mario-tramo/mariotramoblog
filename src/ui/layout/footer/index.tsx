import { getSite } from '@/sanity/lib/queries'
import { urlFor } from '@/sanity/lib/image'
import FooterContent from './FooterContent'
import StayInTheGame from './StayInTheGame'

export default async function Footer() {
	const { blurb, copyright, footerLinks, socialLinks, logo, title } =
		await getSite()

	const logoUrl = logo?.asset ? urlFor(logo).height(128).url() : undefined

	return (
		<>
			<StayInTheGame
				blurb={blurb}
				socialLinks={socialLinks}
				logoUrl={logoUrl}
				siteTitle={title}
			/>
			<FooterContent
				copyright={copyright}
				footerLinks={footerLinks}
				showNewsletter={false}
			/>
		</>
	)
}
