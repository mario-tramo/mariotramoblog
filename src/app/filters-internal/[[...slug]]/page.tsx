import PublicPage, { generateMetadata as publicGenerateMetadata } from '@/app/(frontend)/[[...slug]]/page'
import { runWithSearchParams, type RequestSearchParams } from '@/lib/request-context'

 type Params = { slug?: string[] }
type Props = {
	params: Promise<Params>
	searchParams: Promise<RequestSearchParams>
}

export const dynamic = 'force-dynamic'

export default async function FilteredPage({ params, searchParams }: Props) {
	const query = await searchParams
	return runWithSearchParams(query, () => PublicPage({ params, searchParams }))
}

export async function generateMetadata({ params, searchParams }: Props) {
	const query = await searchParams
	return runWithSearchParams(query, () => publicGenerateMetadata({ params, searchParams }))
}
