import { ResponsiveImg } from '@/ui/primitives/Img'
import CustomHTML from './CustomHTML'

type AssetType = Sanity.Img | Sanity.CustomHTML | Sanity.Code

export default function Asset({ asset }: { asset?: AssetType }) {
	if (!asset) return null

	const Component = ASSET_MAP[asset._type] as
		| React.ComponentType<{ asset: AssetType }>
		| undefined

	return Component ? <Component asset={asset} /> : null
}

const ASSET_MAP = {
	img: ({ asset }: { asset: Sanity.Img }) => (
		<ResponsiveImg img={asset} className="w-full" width={1200} />
	),
	'custom-html': ({ asset }: { asset: Sanity.CustomHTML }) => (
		<CustomHTML {...asset} />
	),
	code: ({ asset }: { asset: Sanity.Code }) => (
		<pre className="overflow-x-auto rounded-lg bg-ink/5 p-4 text-sm">
			{asset.filename && (
				<div className="mb-2 text-xs text-muted-foreground">{asset.filename}</div>
			)}
			<code className={asset.language ? `language-${asset.language}` : undefined}>
				{asset.code}
			</code>
		</pre>
	),
} as const
