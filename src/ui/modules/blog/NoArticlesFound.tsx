import Link from 'next/link'
import { fetchSanityLive } from '@/sanity/lib/fetch'
import groq from 'groq'
import { IMAGE_QUERY } from '@/sanity/lib/queries'
import PostPreview from './PostPreview'

export default async function NoArticlesFound() {
	const [categories, latestPosts] = await Promise.all([
		fetchSanityLive<{ _id: string; title: string; slug: string }[]>({
			query: groq`*[
				_type == 'blog.category'
			]|order(title){ _id, title, "slug": slug.current }`,
		}),
		fetchSanityLive<Sanity.BlogPost[]>({
			query: groq`*[
				_type == 'blog.post'
			]|order(publishDate desc)[0...4]{
				...,
				'title': coalesce(title, metadata.title),
				categories[]->,
				authors[]->,
				metadata{
					...,
					image { ${IMAGE_QUERY} }
				}
			}`,
		}),
	])

	return (
		<div>
			{/* ── Hero ── */}
			<section
				className="relative flex min-h-[340px] items-center justify-center overflow-hidden"
			>
				{/* Content */}
				<div className="relative flex w-full max-w-[760px] flex-col items-center px-6 py-12 text-center">
					{/* Calendar icon with X badge */}
					<div className="relative mb-5 inline-flex">
						<div
							className="flex items-center justify-center"
							style={{
								background: 'rgba(22, 22, 22, 0.9)',
								border: '1px solid rgba(255, 255, 255, 0.07)',
								borderRadius: 14,
								padding: '1rem',
							}}
						>
							<svg
								width="46"
								height="46"
								viewBox="0 0 24 24"
								fill="none"
								stroke="var(--color-brand)"
								strokeWidth={1.6}
								strokeLinecap="round"
								strokeLinejoin="round"
								aria-hidden="true"
							>
								<rect x="3" y="4" width="18" height="18" rx="2" />
								<line x1="16" y1="2" x2="16" y2="6" />
								<line x1="8" y1="2" x2="8" y2="6" />
								<line x1="3" y1="10" x2="21" y2="10" />
								<line x1="10" y1="14" x2="14" y2="18" />
								<line x1="14" y1="14" x2="10" y2="18" />
							</svg>
						</div>
						<div
							className="absolute flex items-center justify-center"
							style={{
								bottom: -5,
								right: -5,
								width: 20,
								height: 20,
								borderRadius: '50%',
								background: 'var(--color-brand)',
								border: '2px solid #080808',
							}}
						>
							<svg
								width="9"
								height="9"
								viewBox="0 0 24 24"
								fill="none"
								stroke="white"
								strokeWidth={3.5}
								strokeLinecap="round"
								aria-hidden="true"
							>
								<line x1="18" y1="6" x2="6" y2="18" />
								<line x1="6" y1="6" x2="18" y2="18" />
							</svg>
						</div>
					</div>

					<h1
						style={{
							fontFamily: "'Barlow Condensed', sans-serif",
							fontWeight: 800,
							fontSize: 'clamp(2.2rem, 4.5vw, 4rem)',
							lineHeight: 1.05,
							color: '#fff',
							textTransform: 'uppercase',
							letterSpacing: '0.01em',
							marginBottom: '1.1rem',
						}}
					>
						Qui non c&apos;è ancora{' '}
						<em className="text-brand italic">
							azione
						</em>
					</h1>

					<p
						className="mx-auto text-muted"
						style={{
							fontSize: '1rem',
							lineHeight: 1.65,
							maxWidth: 500,
							marginBottom: '2.5rem',
						}}
					>
						Non abbiamo trovato articoli in questa sezione.
						<br />
						Nel frattempo, scopri analisi, news e approfondimenti
						da altre categorie.
					</p>

					<div className="flex flex-wrap items-center justify-center gap-4">
						<Link
							href="/"
							className="action flex items-center gap-[7px]"
							style={{
								borderRadius: 6,
								padding: '0.82rem 2rem',
								fontSize: '0.88rem',
								letterSpacing: '0.09em',
								textTransform: 'uppercase',
							}}
						>
							<svg
								width="15"
								height="15"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth={2.2}
								strokeLinecap="round"
								strokeLinejoin="round"
								aria-hidden="true"
							>
								<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
								<path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
							</svg>
							Torna alla Home
						</Link>
						<a
							href="#esplora-categorie"
							style={{
								background: 'transparent',
								color: '#fff',
								border: '1.5px solid rgba(255, 255, 255, 0.25)',
								borderRadius: 6,
								padding: '0.82rem 2rem',
								fontFamily: "'Barlow Condensed', sans-serif",
								fontSize: '0.88rem',
								fontWeight: 700,
								letterSpacing: '0.09em',
								textTransform: 'uppercase',
							}}
						>
							Esplora le Categorie
						</a>
					</div>
				</div>
			</section>

			{/* ── Explore Categories ── */}
			{categories && categories.length > 0 && (
				<section
					id="esplora-categorie"
					style={{ padding: '2.5rem 0' }}
				>
					<div className="mx-auto max-w-[1100px] px-6">
						<h2
							className="mb-10 text-center uppercase text-muted"
							style={{
								fontFamily: "'Barlow Condensed', sans-serif",
								fontSize: '1.25rem',
								fontWeight: 700,
								letterSpacing: '0.12em',
							}}
						>
							Esplora le Categorie
						</h2>
						<div className="overflow-fade-r -mx-6 flex gap-4 overflow-x-auto px-6 pb-4 no-scrollbar">
							{categories.map((cat) => {
								const meta = getCategoryMeta(cat.slug)
								return (
									<Link
										key={cat._id}
										href={`/${cat.slug}`}
										className="group flex shrink-0 cursor-pointer flex-col items-center text-center"
										style={{
											border: '1px solid rgb(39, 39, 39)',
											borderRadius: 10,
											padding: '1.6rem 1rem',
											width: 150,
										}}
									>
										<div
											className="flex items-center justify-center"
											style={{
												width: 50,
												height: 50,
												borderRadius: '50%',
												border: '1px solid rgb(42, 42, 42)',
												marginBottom: '0.85rem',
												color: meta.highlight
													? 'var(--color-brand)'
													: '#aaa',
											}}
										>
											<span
												dangerouslySetInnerHTML={{
													__html: meta.icon,
												}}
											/>
										</div>
										<div
											style={{
												fontFamily:
													"'Barlow Condensed', sans-serif",
												fontSize: '0.95rem',
												fontWeight: 700,
												letterSpacing: '0.07em',
												color: '#fff',
												textTransform: 'uppercase',
												marginBottom: '0.28rem',
											}}
										>
											{cat.title}
										</div>
										<div
											style={{
												fontSize: '0.71rem',
												lineHeight: 1.3,
											}}
											className="text-muted/80"
										>
											{meta.subtitle}
										</div>
									</Link>
								)
							})}
						</div>
					</div>
				</section>
			)}

			{/* ── Latest Updates ── */}
			{latestPosts && latestPosts.length > 0 && (
				<section
					style={{ padding: '2.5rem 0 2rem' }}
				>
					<div className="mx-auto max-w-[1100px] px-6">
						<div className="mb-8 flex items-center justify-between">
							<div className="flex items-center gap-[10px]">
								<div
									style={{
										width: 4,
										height: 26,
										background: 'var(--color-brand)',
										borderRadius: 2,
									}}
								/>
								<h2
									style={{
										fontFamily:
											"'Barlow Condensed', sans-serif",
										fontSize: '1.45rem',
										fontWeight: 800,
										color: '#fff',
										letterSpacing: '0.07em',
										textTransform: 'uppercase',
									}}
								>
									Ultimi Aggiornamenti
								</h2>
							</div>
							<Link
								href="/"
								className="flex items-center gap-1 text-muted/80"
								style={{
									fontSize: '0.82rem',
									textDecoration: 'none',
								}}
							>
								Vedi tutti gli articoli{' '}
								<span
									style={{
										color: 'var(--color-brand)',
										fontWeight: 700,
									}}
								>
									&rarr;
								</span>
							</Link>
						</div>
						<ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
							{latestPosts.map((post) => (
								<li className="anim-fade" key={post._id}>
									<PostPreview post={post} />
								</li>
							))}
						</ul>
					</div>
				</section>
			)}

		</div>
	)
}

/** Map category slugs to icons and subtitles */
function getCategoryMeta(slug: string): {
	icon: string
	subtitle: string
	highlight?: boolean
} {
	const iconMap: Record<
		string,
		{ icon: string; subtitle: string; highlight?: boolean }
	> = {
		calcio: {
			icon: '<svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="1"/></svg>',
			subtitle: 'News e Analisi',
		},
		tennis: {
			icon: '<svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="1"/></svg>',
			subtitle: 'Tornei e Atp/Wta',
		},
		motori: {
			icon: '<svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/></svg>',
			subtitle: 'F1, MotoGP e altro',
		},
		trending: {
			icon: '<svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4"/></svg>',
			subtitle: 'I più letti del momento',
			highlight: true,
		},
		editoriali: {
			icon: '<svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/></svg>',
			subtitle: 'Approfondimenti',
		},
		betting: {
			icon: '<svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 21v-6"/><path d="M12 21V3"/><path d="M19 21V9"/></svg>',
			subtitle: 'Guide e Pronostici',
		},
	}

	return (
		iconMap[slug] ?? {
			icon: '<svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>',
			subtitle: 'Scopri di più',
		}
	)
}
