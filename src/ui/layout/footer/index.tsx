import dynamic from 'next/dynamic'
import { getSite } from '@/sanity/lib/queries'
import { urlFor } from '@/sanity/lib/image'
import FooterPathAware from './FooterPathAware'

const FooterContent = dynamic(() => import('./FooterContent'))
const StayInTheGame = dynamic(() => import('./StayInTheGame'))

export default async function Footer() {
	const { blurb, copyright, footerLinks, socialLinks, logo, title } = await getSite()
	const logoUrl = logo?.asset ? urlFor(logo).height(128).url() : undefined

	return (
		<FooterPathAware
			stayInTheGame={
				<StayInTheGame blurb={blurb} socialLinks={socialLinks} />
			}
			footer={
				<FooterContent
					copyright={copyright}
					footerLinks={footerLinks}
					showNewsletter={false}
					logoUrl={logoUrl}
					siteTitle={title}
					socialLinks={socialLinks}
				/>
			}
		/>
	)
}
