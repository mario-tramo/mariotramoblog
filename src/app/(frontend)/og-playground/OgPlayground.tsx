'use client'

import { useMemo, useState } from 'react'

export type PlaygroundPost = {
	id: string
	title: string
	description: string
	category: string | null
	date: string | null
	imageUrl: string | null
	path: string
}

type Fields = {
	title: string
	description: string
	category: string
	date: string
	imageUrl: string
	path: string
}

const CUSTOM = '__custom__'

// SEO / conversion sweet spots
const TITLE_IDEAL = 60
const TITLE_MAX = 70
const DESC_MIN = 110
const DESC_IDEAL = 155
const DESC_MAX = 170

export default function OgPlayground({
	posts,
	baseUrl,
}: {
	posts: PlaygroundPost[]
	baseUrl: string
}) {
	const domain = baseUrl.replace(/https?:\/\//, '').replace(/\/+$/, '')
	const [selected, setSelected] = useState<string>(posts[0]?.id ?? CUSTOM)

	const initial = useMemo<Fields>(() => fieldsFromPost(posts[0]), [posts])
	const [fields, setFields] = useState<Fields>(initial)

	function loadPost(id: string) {
		setSelected(id)
		if (id === CUSTOM) return
		const post = posts.find((p) => p.id === id)
		if (post) setFields(fieldsFromPost(post))
	}

	function set<K extends keyof Fields>(key: K, value: Fields[K]) {
		setSelected(CUSTOM)
		setFields((f) => ({ ...f, [key]: value }))
	}

	// The actual OG card the site emits.
	const ogImageUrl = useMemo(() => {
		const params = new URLSearchParams()
		if (fields.title) params.set('title', fields.title)
		if (fields.description) params.set('description', fields.description)
		if (fields.category) params.set('category', fields.category)
		if (fields.date) params.set('date', fields.date)
		if (fields.imageUrl) {
			const sep = fields.imageUrl.includes('?') ? '&' : '?'
			params.set('image', `${fields.imageUrl}${sep}w=1200&h=630&fit=crop`)
		}
		return `${baseUrl}/api/og?${params.toString()}`
	}, [baseUrl, fields])

	const url = `${domain}/${fields.path}`

	const shared: Shared = { ...fields, domain, ogImageUrl, url }

	return (
		<div className="mx-auto w-full max-w-6xl px-4 py-6 text-ink sm:px-5 sm:py-8">
			<header className="mb-4 sm:mb-6">
				<h1 className="text-xl font-black tracking-tight sm:text-2xl">OG Playground</h1>
				<p className="mt-1 text-xs text-muted sm:text-sm">
					Anteprima delle preview social, generate dallo stesso endpoint
					(<code>/api/og</code>) usato in produzione. Scegli un articolo reale o
					modifica i campi per prototipare.
				</p>
			</header>

			<div className="grid gap-4 md:gap-6 lg:grid-cols-[280px_1fr] xl:grid-cols-[320px_1fr]">
				{/* ---- Controls ---- */}
				<aside className="space-y-3 sm:space-y-4">
					<label className="block">
						<span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">
							Articolo
						</span>
						<select
							value={selected}
							onChange={(e) => loadPost(e.target.value)}
							className="w-full rounded-lg border border-line bg-surface px-3 py-1.5 text-xs"
						>
							{posts.map((p) => (
								<option key={p.id} value={p.id}>
									{p.title}
								</option>
							))}
							<option value={CUSTOM}>— Personalizzato —</option>
						</select>
					</label>

					<Field
						label="Titolo"
						value={fields.title}
						onChange={(v) => set('title', v)}
						count={fields.title.length}
						ideal={TITLE_IDEAL}
						max={TITLE_MAX}
					/>

					<Field
						label="Descrizione"
						value={fields.description}
						onChange={(v) => set('description', v)}
						textarea
						count={fields.description.length}
						idealMin={DESC_MIN}
						ideal={DESC_IDEAL}
						max={DESC_MAX}
					/>

					<label className="block">
						<span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">
							Categoria
						</span>
						<input
							value={fields.category}
							onChange={(e) => set('category', e.target.value)}
							className="w-full rounded-lg border border-line bg-surface px-3 py-1.5 text-xs"
						/>
					</label>

					<label className="block">
						<span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">
							Immagine (URL)
						</span>
						<input
							value={fields.imageUrl}
							onChange={(e) => set('imageUrl', e.target.value)}
							placeholder="https://cdn.sanity.io/…"
							className="w-full rounded-lg border border-line bg-surface px-3 py-1.5 text-xs"
						/>
					</label>

					<label className="block">
						<span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">
							Data
						</span>
						<input
							type="date"
							value={fields.date}
							onChange={(e) => set('date', e.target.value)}
							className="w-full rounded-lg border border-line bg-surface px-3 py-1.5 text-xs"
						/>
					</label>

					<a
						href={ogImageUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="block break-all rounded-lg bg-ink/5 p-3 text-xs text-muted hover:bg-ink/10"
					>
						{ogImageUrl}
					</a>
				</aside>

				{/* ---- Previews ---- */}
				<main className="space-y-6 sm:space-y-8">
					<Section title="Card OG (1200×630) — sorgente unica">
					{/* Raw <img> — playground for next/og behaviour, not user-facing. */}
					<img
							src={ogImageUrl}
							alt="OG card"
							className="w-full max-w-full rounded-xl border border-line shadow-lg sm:max-w-[640px]"
							style={{ aspectRatio: '1200 / 630' }}
						/>
					</Section>

					<Section title="Dati di condivisione (metadati reali)">
						<MetaPanel
							rows={[
								['og:title', fields.title],
								['og:description', fields.description],
								['og:type', 'article'],
								['og:url (canonical)', `${baseUrl}/${fields.path}`],
								['og:image', ogImageUrl],
								['og:site_name', 'Trm Sport'],
								['twitter:card', 'summary_large_image'],
							]}
						/>
					</Section>

					<Section title="X (Twitter)">
						<TwitterCard {...shared} />
					</Section>

					<Section title="Facebook">
						<FacebookCard {...shared} />
					</Section>

					<Section title="LinkedIn">
						<LinkedInCard {...shared} />
					</Section>

					<Section title="WhatsApp">
						<WhatsAppCard {...shared} />
					</Section>

					<Section title="Discord">
						<DiscordCard {...shared} />
					</Section>

					<Section title="Google (risultato di ricerca)">
						<GoogleResult {...shared} />
					</Section>
				</main>
			</div>
		</div>
	)
}

// ----------------------------------------------------------------------------
// Helpers + shared bits
// ----------------------------------------------------------------------------

type Shared = {
	title: string
	description: string
	domain: string
	ogImageUrl: string
	url: string
}

function fieldsFromPost(post?: PlaygroundPost): Fields {
	return {
		title: post?.title ?? '',
		description: post?.description ?? '',
		category: post?.category ?? '',
		date: (post?.date ?? '').slice(0, 10),
		imageUrl: post?.imageUrl ?? '',
		path: post?.path ?? '',
	}
}

function MetaPanel({ rows }: { rows: [string, string][] }) {
	return (
		<div className="max-w-full overflow-hidden rounded-xl border border-line sm:max-w-[720px]">
			{rows.map(([key, value], i) => (
				<div
					key={key}
					className={`flex flex-col gap-0.5 px-3 py-2 sm:flex-row sm:gap-4 sm:px-4 sm:py-2.5 ${
						i % 2 ? 'bg-ink/[0.02]' : ''
					}`}
				>
					<span className="w-full shrink-0 font-mono text-[11px] font-semibold text-muted sm:w-[180px] sm:text-xs">
						{key}
					</span>
					<span className="break-all text-xs text-ink sm:text-sm">
						{value || <em className="text-amber-600">— vuoto —</em>}
					</span>
				</div>
			))}
		</div>
	)
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<section>
			<h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-muted">
				{title}
			</h2>
			{children}
		</section>
	)
}

function Field({
	label,
	value,
	onChange,
	textarea,
	count,
	idealMin,
	ideal,
	max,
}: {
	label: string
	value: string
	onChange: (v: string) => void
	textarea?: boolean
	count: number
	idealMin?: number
	ideal: number
	max: number
}) {
	const tone =
		count > max
			? 'text-red-600'
			: count > ideal || (idealMin !== undefined && count < idealMin)
				? 'text-amber-600'
				: 'text-emerald-600'

	return (
		<label className="block">
			<span className="mb-1 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted">
				{label}
				<span className={'text-[11px] ' + tone}>
					{count}
					{idealMin !== undefined ? `/${idealMin}–${ideal}` : `/${ideal}`}
				</span>
			</span>
			{textarea ? (
				<textarea
					value={value}
					onChange={(e) => onChange(e.target.value)}
					rows={2}
					className="w-full resize-y rounded-lg border border-line bg-surface px-3 py-1.5 text-xs"
				/>
			) : (
				<input
					value={value}
					onChange={(e) => onChange(e.target.value)}
					className="w-full rounded-lg border border-line bg-surface px-3 py-1.5 text-xs"
				/>
			)}
		</label>
	)
}

function Img({ src, className, style }: { src: string; className?: string; style?: React.CSSProperties }) {
	// Raw <img> — deliberate, see @next/next/no-img-element comment above.
	return <img src={src} alt="" className={className} style={style} />
}

// ----------------------------------------------------------------------------
// Platform mockups
// ----------------------------------------------------------------------------

function TwitterCard({ title, domain, ogImageUrl }: Shared) {
	return (
		<div className="max-w-full overflow-hidden rounded-2xl border border-[#cfd9de] bg-white font-sans sm:max-w-[520px]">
			<div className="relative" style={{ aspectRatio: '1200 / 630' }}>
				<Img src={ogImageUrl} className="absolute inset-0 size-full object-cover" />
				<span className="absolute bottom-2 left-2 rounded bg-black/60 px-1.5 py-0.5 text-[11px] text-white sm:text-xs">
					{title}
				</span>
			</div>
			<div className="px-3 py-2 text-xs text-[#536471] sm:text-[13px]">{domain}</div>
		</div>
	)
}

function FacebookCard({ title, description, domain, ogImageUrl }: Shared) {
	return (
		<div className="max-w-full overflow-hidden rounded-lg border border-[#dadde1] bg-white font-sans sm:max-w-[520px]">
			<Img src={ogImageUrl} className="w-full object-cover" style={{ aspectRatio: '1200 / 630' }} />
			<div className="bg-[#f2f3f5] px-3 py-2.5">
				<div className="text-[10px] uppercase tracking-wide text-[#606770] sm:text-[12px]">{domain}</div>
				<div className="mt-0.5 line-clamp-2 text-sm font-semibold leading-snug text-[#1d2129] sm:text-[16px]">
					{title}
				</div>
				{description && (
					<div className="mt-0.5 line-clamp-1 text-xs text-[#606770] sm:text-[14px]">{description}</div>
				)}
			</div>
		</div>
	)
}

function LinkedInCard({ title, domain, ogImageUrl }: Shared) {
	return (
		<div className="max-w-full overflow-hidden rounded-lg border border-[#e0e0e0] bg-white font-sans shadow-sm sm:max-w-[520px]">
			<Img src={ogImageUrl} className="w-full object-cover" style={{ aspectRatio: '1200 / 630' }} />
			<div className="px-3 py-3">
				<div className="line-clamp-2 text-sm font-semibold leading-snug text-[#000000e6] sm:text-[16px]">
					{title}
				</div>
				<div className="mt-1 text-[11px] text-[#00000099] sm:text-[12px]">{domain}</div>
			</div>
		</div>
	)
}

function WhatsAppCard({ title, description, domain, ogImageUrl, url }: Shared) {
	return (
		<div className="max-w-full rounded-xl bg-[#d9fdd3] p-1.5 font-sans shadow-sm sm:max-w-[400px]">
			<div className="overflow-hidden rounded-lg bg-white/70">
				<Img src={ogImageUrl} className="w-full object-cover" style={{ aspectRatio: '1200 / 630' }} />
				<div className="px-2.5 py-2">
					<div className="line-clamp-2 text-xs font-medium leading-snug text-[#111b21] sm:text-[13px]">
						{title}
					</div>
					{description && (
						<div className="mt-0.5 line-clamp-2 text-[11px] text-[#667781] sm:text-[12px]">{description}</div>
					)}
					<div className="mt-0.5 text-[11px] text-[#667781] sm:text-[12px]">{domain}</div>
				</div>
			</div>
			<div className="px-2 pt-1 text-[11px] text-[#53bdeb] sm:text-[12px]">{url}</div>
		</div>
	)
}

function DiscordCard({ title, description, domain, ogImageUrl }: Shared) {
	return (
		<div className="max-w-full rounded border-l-4 border-[#e63946] bg-[#2b2d31] p-3 font-sans text-white sm:max-w-[460px]">
			<div className="text-[11px] text-[#b5bac1] sm:text-[12px]">{domain}</div>
			<div className="mt-1 text-sm font-semibold leading-snug text-[#00a8fc] sm:text-[16px]">{title}</div>
			{description && <div className="mt-1 text-xs text-[#dbdee1] sm:text-[14px]">{description}</div>}
			<Img
				src={ogImageUrl}
				className="mt-3 w-full rounded object-cover"
				style={{ aspectRatio: '1200 / 630' }}
			/>
		</div>
	)
}

function GoogleResult({ title, description, domain, url }: Shared) {
	return (
		<div className="max-w-full sm:max-w-[600px]" style={{ fontFamily: 'arial, sans-serif' }}>
			<div className="flex items-center gap-2">
				<div className="grid size-7 place-items-center rounded-full border border-[#dadce0] bg-white text-[12px] font-bold text-[#e63946]">
					T
				</div>
				<div className="leading-tight">
					<div className="text-[14px] text-[#202124]">TRM Sport</div>
					<div className="text-[12px] text-[#4d5156]">{url}</div>
				</div>
			</div>
			<div className="mt-1 text-base leading-snug text-[#1a0dab] hover:underline sm:text-[20px]">
				{title}
			</div>
			{description && (
				<div className="mt-1 line-clamp-2 text-xs leading-snug text-[#4d5156] sm:text-[14px]">
					{description}
				</div>
			)}
			<div className="sr-only">{domain}</div>
		</div>
	)
}
