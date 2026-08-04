import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import PublicPage, { generateMetadata as publicGenerateMetadata } from '@/app/(frontend)/[[...slug]]/page'
import { runInPreview } from '@/sanity/lib/preview-context'
import { runWithSearchParams } from '@/lib/request-context'

type Params = { slug?: string[] }
type Props = {
	params: Promise<Params>
	searchParams: Promise<Record<string, string | string[] | undefined>>
}

export const dynamic = 'force-dynamic'

export default async function PreviewPage(props: Props) {
	if (!(await draftMode()).isEnabled) redirect('/')
	const query = await props.searchParams
	return runInPreview(() => runWithSearchParams(query, () => PublicPage(props)))
}

export async function generateMetadata(props: Props) {
	const query = await props.searchParams
	const metadata = await runInPreview(() =>
		runWithSearchParams(query, () => publicGenerateMetadata(props)),
	)
	return {
		...metadata,
		robots: { index: false, follow: false },
	}
}
