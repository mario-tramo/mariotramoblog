import Pretitle from '@/ui/primitives/Pretitle'
import { PortableText } from 'next-sanity'
import type { PortableTextBlock } from '@portabletext/types'

export type RichtextSubModuleType = Sanity.Module<'richtext'> &
	Partial<{
		pretitle: string
		content: PortableTextBlock[]
	}>

export default function RichtextSubModule({
	module,
}: {
	module: RichtextSubModuleType
}) {
	return (
		<div className="richtext">
			<Pretitle>{module.pretitle}</Pretitle>
			<PortableText value={module.content} />
		</div>
	)
}
