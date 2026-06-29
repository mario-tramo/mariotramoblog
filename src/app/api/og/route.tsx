import { getSite } from '@/sanity/lib/queries'
import { ImageResponse } from 'next/og'
import sharp from 'sharp'
import type { NextRequest } from 'next/server'

// sharp is a native (Node) module — keep this handler off the edge runtime.
export const runtime = 'nodejs'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL!
const domain = BASE_URL?.replace(/https?:\/\//, '').replace(/\/+$/, '')

const INK = '#13141b'
const BRAND = '#e63946'

export async function GET(request: NextRequest) {
	const { searchParams } = request.nextUrl
	const site = await getSite()

	// Strip a trailing " — Site Name" / " | Site Name" the SEO title may carry.
	const regex = new RegExp(`\\s*[-—|]+\\s*${site.title}$`, 'i')
	const title = (searchParams.get('title')?.replace(regex, '') || site.title).trim()
	const category = searchParams.get('category')?.trim()
	const date = searchParams.get('date')
	const rawImageUrl = searchParams.get('image')
	const imageUrl = rawImageUrl && rawImageUrl.startsWith('https://cdn.sanity.io/')
		? rawImageUrl
		: null
	const description = truncate(searchParams.get('description')?.trim(), 150)

	// Scale the title down as it gets longer so it always fits the card.
	// Leave more breathing room when a description is also shown.
	const titleCeiling = description ? 46 : 60
	const titleSize = Math.min(
		titleCeiling,
		title.length > 90 ? 36 : title.length > 60 ? 42 : title.length > 36 ? 50 : 60,
	)

	const fonts = await loadFonts()

	const formattedDate = date
		? safeDate(date)
		: undefined

	const png = new ImageResponse(
		(
			<div
				style={{
					position: 'relative',
					display: 'flex',
					width: '1200px',
					height: '630px',
					backgroundColor: INK,
					fontFamily: 'Inter',
				}}
			>
				{/* Full-bleed featured photo */}
				{imageUrl && (
					// Raw <img> is intentional here: <Image> can't render remote
					// URLs in next/og context and the OG image renderer does its
					// own optimization. We re-encode to JPEG before responding
					// (see below), so this is safe.
					<img
						src={imageUrl}
						alt=""
						width={1200}
						height={630}
						style={{
							position: 'absolute',
							top: 0,
							left: 0,
							width: '1200px',
							height: '630px',
							objectFit: 'cover',
						}}
					/>
				)}

				{/* Readability gradient (darker towards the bottom where the text sits) */}
				<div
					style={{
						position: 'absolute',
						top: 0,
						left: 0,
						width: '1200px',
						height: '630px',
						display: 'flex',
						backgroundImage: imageUrl
							? 'linear-gradient(180deg, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.45) 40%, rgba(0,0,0,0.88) 76%, rgba(0,0,0,1) 100%)'
							: `radial-gradient(circle at 78% 18%, rgba(230,57,70,0.32) 0%, rgba(19,20,27,0) 55%)`,
					}}
				/>

				{/* Top brand accent bar */}
				<div
					style={{
						position: 'absolute',
						top: 0,
						left: 0,
						width: '1200px',
						height: '10px',
						backgroundColor: BRAND,
					}}
				/>

				{/* Content */}
				<div
					style={{
						position: 'relative',
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'flex-end',
						width: '1200px',
						height: '630px',
						padding: '48px',
					}}
				>
					{/* Category chip */}
					{category && (
						<div style={{ display: 'flex', marginBottom: '16px' }}>
							<div
								style={{
									display: 'flex',
									backgroundColor: BRAND,
									color: '#fff',
									fontSize: '17px',
									fontWeight: 700,
									textTransform: 'uppercase',
									letterSpacing: '0.08em',
									padding: '6px 13px',
									borderRadius: '8px',
								}}
							>
								{category}
							</div>
						</div>
					)}

					{/* Title */}
					<div
						style={{
							display: 'flex',
							fontSize: `${titleSize}px`,
							fontWeight: 800,
							lineHeight: 1.08,
							color: '#fff',
							letterSpacing: '-0.02em',
							textShadow: '0 2px 24px rgba(0,0,0,0.45)',
						}}
					>
						{title}
					</div>

					{/* Description / standfirst */}
					{description && (
						<div
							style={{
								display: 'flex',
								marginTop: '14px',
								fontSize: '23px',
								fontWeight: 600,
								lineHeight: 1.35,
								color: 'rgba(255,255,255,0.95)',
								textShadow: '0 1px 12px rgba(0,0,0,0.45)',
								lineClamp: 2,
							}}
						>
							{description}
						</div>
					)}

					{/* Footer: brand wordmark + date */}
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'space-between',
							marginTop: '26px',
						}}
					>
						<div style={{ display: 'flex', alignItems: 'baseline' }}>
							<span style={{ fontSize: '22px', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
								TRM
							</span>
							<span style={{ fontSize: '22px', fontWeight: 800, color: BRAND, letterSpacing: '-0.02em' }}>
								SPORT
							</span>
							<span style={{ fontSize: '16px', fontWeight: 500, color: 'rgba(255,255,255,0.65)', marginLeft: '12px' }}>
								{domain}
							</span>
						</div>
						{formattedDate && (
							<span style={{ fontSize: '16px', fontWeight: 500, color: 'rgba(255,255,255,0.65)' }}>
								{formattedDate}
							</span>
						)}
					</div>
				</div>
			</div>
		),
		{
			width: 1200,
			height: 630,
			...(fonts.length > 0 && { fonts }),
		},
	)

	// next/og only emits PNG. A 1200×630 photo as lossless PNG is ~1–1.5 MB,
	// which exceeds the link-preview image budget on WhatsApp/Telegram (they
	// silently drop the large preview). Re-encode to JPEG (~120–180 KB).
	const jpeg = await sharp(Buffer.from(await png.arrayBuffer()))
		.jpeg({ quality: 82, mozjpeg: true })
		.toBuffer()

	return new Response(new Uint8Array(jpeg), {
		headers: {
			'Content-Type': 'image/jpeg',
			'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
		},
	})
}

function truncate(value: string | undefined, max: number): string | undefined {
	if (!value) return undefined
	if (value.length <= max) return value
	return value.slice(0, max - 1).trimEnd() + '…'
}

function safeDate(value: string) {
	const d = new Date(value)
	if (Number.isNaN(d.getTime())) return undefined
	return d.toLocaleDateString('it-IT', { year: 'numeric', month: 'long', day: 'numeric' })
}

type Font = { name: string; data: ArrayBuffer; weight: 400 | 500 | 600 | 700 | 800; style: 'normal' }

/** Loads Inter at the weights the card uses. Never throws: a failed fetch just
 *  drops that weight (next/og falls back to its built-in font). */
async function loadFonts(): Promise<Font[]> {
	const weights: Font['weight'][] = [400, 500, 600, 700, 800]
	const results = await Promise.all(weights.map((w) => loadGoogleFont('Inter', w)))
	return weights
		.map((weight, i) => results[i] && { name: 'Inter', data: results[i] as ArrayBuffer, weight, style: 'normal' as const })
		.filter((f): f is Font => Boolean(f))
}

async function loadGoogleFont(family: string, weight: number): Promise<ArrayBuffer | null> {
	try {
		const url = `https://fonts.googleapis.com/css2?family=${family}:wght@${weight}`
		const css = await (await fetch(url, {
			headers: {
				// Ask Google for a .ttf (Satori can't parse woff2).
				'User-Agent':
					'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
			},
		})).text()
		const resource = css.match(/src:\s*url\((.+?)\)\s*format\(['"]?(?:opentype|truetype)['"]?\)/)
		if (!resource) return null
		const res = await fetch(resource[1])
		if (res.status !== 200) return null
		return await res.arrayBuffer()
	} catch {
		return null
	}
}
