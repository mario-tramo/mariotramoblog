import { getSite } from '@/sanity/lib/queries'
import FooterContent from './FooterContent'

export default async function Footer() {
	const { blurb, copyright, footerLinks, socialLinks, showNewsletter } =
		await getSite()

	return (
		<FooterContent
			blurb={blurb}
			copyright={copyright}
			footerLinks={footerLinks}
			socialLinks={socialLinks}
			showNewsletter={false}
		/>
	)
}
