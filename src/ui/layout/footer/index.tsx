import { getSite } from '@/sanity/lib/queries'
import { urlFor } from '@/sanity/lib/image'
import FooterContent from './FooterContent'

export default async function Footer() {
	const { blurb, copyright, footerLinks, socialLinks, showNewsletter, logo, title } =
		await getSite()

	const logoUrl = logo?.asset ? urlFor(logo).height(128).url() : undefined

	return (
		<FooterContent
			blurb={blurb}
			copyright={copyright}
			footerLinks={footerLinks}
			socialLinks={socialLinks}
			showNewsletter={false}
			logoUrl={logoUrl}
			siteTitle={title}
		/>
	)
}
