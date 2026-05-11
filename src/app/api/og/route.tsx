import { getSite } from '@/sanity/lib/queries'
import { ImageResponse } from 'next/og'
import type { NextRequest } from 'next/server'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL!
const domain = BASE_URL?.replace(/https?:\/\//, '')
const INK = '#13141b'

export async function GET(request: NextRequest) {
	const { searchParams } = request.nextUrl
	const site = await getSite()

	const regex = new RegExp(` [-—|]+ ${site.title}$`)
	const title = searchParams.get('title')?.replace(regex, '') || site.title
	const category = searchParams.get('category')
	const date = searchParams.get('date')
	const imageUrl = searchParams.get('image')

	const [fontData] = await Promise.all([loadGoogleFont()])

	return new ImageResponse(
		(
			<div
				style={{
					display: 'flex',
					width: '100%',
					height: '100%',
					backgroundColor: '#fff',
					color: INK,
					fontFamily: 'Inter',
				}}
			>
				{/* Left content */}
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'space-between',
						padding: '4rem',
						flex: 1,
					}}
				>
					{/* Category badge */}
					{category && (
						<div
							style={{
								display: 'flex',
								alignItems: 'center',
								gap: '0.5rem',
							}}
						>
							<span
								style={{
									fontSize: '1.25rem',
									fontWeight: 600,
									color: '#e63946',
									textTransform: 'uppercase',
									letterSpacing: '0.1em',
								}}
							>
								{category}
							</span>
						</div>
					)}

					{/* Title */}
					<div
						style={{
							fontSize: imageUrl ? '3rem' : '4.5rem',
							fontWeight: 700,
							lineHeight: 1.15,
							flex: 1,
							display: 'flex',
							alignItems: 'center',
							marginTop: '1rem',
							marginBottom: '1rem',
						}}
					>
						{title}
					</div>

					{/* Footer */}
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'space-between',
							fontSize: '1.25rem',
							color: `${INK}99`,
						}}
					>
						<span style={{ fontWeight: 600, color: INK }}>{domain}</span>
						{date && <span>{new Date(date).toLocaleDateString('it-IT', { year: 'numeric', month: 'long', day: 'numeric' })}</span>}
					</div>
				</div>

				{/* Right image */}
				{imageUrl && (
					<div
						style={{
							display: 'flex',
							width: '420px',
							flexShrink: 0,
							overflow: 'hidden',
						}}
					>
						<img
							src={imageUrl}
							style={{ width: '100%', height: '100%', objectFit: 'cover' }}
						/>
					</div>
				)}
			</div>
		),
		{
			width: 1200,
			height: 630,
			fonts: [{ name: 'Inter', data: fontData, weight: 700 }],
		},
	)
}

async function loadGoogleFont() {
	const url = `https://fonts.googleapis.com/css2?family=Inter:wght@700`
	const css = await (await fetch(url)).text()
	const resource = css.match(/src: url\((.+)\) format\('(opentype|truetype)'\)/)
	if (resource) {
		const response = await fetch(resource[1])
		if (response.status === 200) return response.arrayBuffer()
	}
	throw new Error('failed to load font data')
}
