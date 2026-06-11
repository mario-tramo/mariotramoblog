import { headers } from 'next/headers'
import { getSite } from '@/sanity/lib/queries'
import { urlFor } from '@/sanity/lib/image'
import FooterContent from './FooterContent'
import StayInTheGame from './StayInTheGame'
import { HomepageSeoFooter } from '@/ui/modules/HomepageSeo'

const HIDE_STAY_IN_GAME_SLUGS = ['/contatti']

export default async function Footer() {
	const [{ blurb, copyright, footerLinks, socialLinks, logo, title }, hdrs] =
		await Promise.all([getSite(), headers()])

	const pathname = hdrs.get('x-pathname') ?? ''
	const isHomepage = pathname === '' || pathname === '/'
	const hideStayInGame = HIDE_STAY_IN_GAME_SLUGS.some((s) => pathname === s)

	const logoUrl = logo?.asset ? urlFor(logo).height(128).url() : undefined

	return (
		<>
			{!hideStayInGame && (
				<StayInTheGame
					blurb={blurb}
					socialLinks={socialLinks}
					logoUrl={logoUrl}
					siteTitle={title}
				/>
			)}
			<FooterContent
				copyright={copyright}
				footerLinks={footerLinks}
				showNewsletter={false}
			/>
			{isHomepage && <HomepageSeoFooter />}
		</>
	)
}
