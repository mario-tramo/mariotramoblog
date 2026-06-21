import { Suspense } from 'react'
import moduleProps from '@/lib/moduleProps'
import Link from 'next/link'
import { Img } from '@/ui/primitives/Img'
import Date from '@/ui/primitives/Date'
import Categories from './Categories'
import ReadTime from './ReadTime'
import ShareBar from './ShareBar'
import ShareBarFooter from './ShareBarFooter'
import TableOfContents from '@/ui/modules/RichtextModule/TableOfContents'
import Content from '@/ui/modules/RichtextModule/Content'
import RelatedPosts from './RelatedPosts'
import ChevronIcon from '@/ui/icons/ChevronIcon'
import SectionCard from '@/ui/primitives/SectionCard'
import { cn, getInitials } from '@/lib/utils'
import { FaLinkedinIn, FaInstagram, FaXTwitter } from 'react-icons/fa6'
import { IoIosLink } from 'react-icons/io'
import { RelatedPostsSkeleton } from '@/ui/skeletons/PostContentSkeleton'
import GooglePreferredSourceBanner from './GooglePreferredSourceBanner'
import css from './PostContent.module.css'

function AuthorSocialIcon({ url }: { url: string }) {
	if (url.includes('linkedin.com')) return <FaLinkedinIn className="size-3.5" />
	if (url.includes('instagram.com')) return <FaInstagram className="size-3.5" />
	if (url.includes('x.com') || url.includes('twitter.com')) return <FaXTwitter className="size-3.5" />
	return <IoIosLink className="size-3.5" />
}

export default function PostContent({
	post,
	...props
}: { post?: Sanity.BlogPost } & Sanity.Module) {
	if (!post) return null

	const showTOC = !post.hideTableOfContents && !!post.headings?.length
	const firstAuthor = post.authors?.[0]

	return (
		<article {...moduleProps(props)}>
			{/* Breadcrumb */}
			<nav
				aria-label="Navigazione breadcrumb"
				className="mx-auto max-w-screen-2xl px-4 pt-4 sm:px-6"
			>
				<ol className="flex flex-wrap items-center gap-1 text-xs text-muted" itemScope itemType="https://schema.org/BreadcrumbList">
					<li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
						<Link href="/" itemProp="item" itemScope itemType="https://schema.org/WebPage" className="transition hover:text-ink">
							<span itemProp="name">Home page</span>
						</Link>
						<meta itemProp="position" content="1" />
					</li>
					<span aria-hidden="true" className="text-muted">&gt;</span>
					<li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
						<Link
							href="/"
							itemProp="item" itemScope itemType="https://schema.org/WebPage"
							className="transition hover:text-ink"
						>
							<span itemProp="name">Notizie</span>
						</Link>
						<meta itemProp="position" content="2" />
					</li>
					{post.categories?.[0] && (
						<>
							<span aria-hidden="true" className="text-muted">&gt;</span>
							<li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
								<Link
									href={`/${post.categories[0].slug.current}`}
									itemProp="item" itemScope itemType="https://schema.org/WebPage"
									className="transition hover:text-ink"
								>
									<span itemProp="name">{post.categories[0].title}</span>
								</Link>
								<meta itemProp="position" content="3" />
							</li>
						</>
					)}
					<span aria-hidden="true" className="text-muted">&gt;</span>
					<li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem" className="truncate text-brand">
						<span itemProp="name">{post.title}</span>
						<meta itemProp="position" content={String(post.categories?.[0] ? 4 : 3)} />
					</li>
				</ol>
			</nav>

			{/* 2-column layout */}
			<div className="mx-auto grid max-w-screen-2xl gap-10 px-4 pt-8 pb-16 sm:px-6 sm:pb-20 lg:grid-cols-[1fr_380px]">
				{/* Main content */}
				<div className="min-w-0">
					{/* Header */}
					<header className="space-y-5">
						{/* Category tag */}
						{post.categories?.[0] && (
							<Categories
								className="flex flex-wrap gap-2"
								categories={[post.categories[0]]}
								linked
							/>
						)}

						<h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
							{post.title}
						</h1>

						{post.metadata.description && (
							<p className="text-base leading-relaxed text-muted sm:text-lg">
								{post.metadata.description}
							</p>
						)}

						{/* Author bar + share */}
						<div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-y border-line py-4 text-sm text-muted">
							<div className="flex items-center gap-2">
								{firstAuthor ? (
									<>
										<span className="grid size-9 place-items-center rounded-full bg-brand text-xs font-bold text-brand-foreground">
											{firstAuthor.image ? (
												<Img
													className="size-full rounded-full object-cover"
													image={firstAuthor.image}
													width={72}
													alt={firstAuthor.name}
												/>
											) : (
												getInitials(firstAuthor.name)
											)}
										</span>
										<div className="leading-tight">
											<p className="text-sm font-semibold text-ink">
												Di{' '}
												{firstAuthor.slug?.current ? (
													<Link
														href={`/autori/${firstAuthor.slug.current}`}
														className="hover:text-brand hover:underline"
													>
														{firstAuthor.name}
													</Link>
												) : (
													firstAuthor.name
												)}
											</p>
											<p className="text-xs">
												<Date value={post.publishDate} />
												{' \u2022 '}
												<ReadTime value={post.readTime} />
											</p>
										</div>
									</>
								) : (
									<>
										<span className="grid size-9 place-items-center rounded-full bg-accent/10 text-xs font-bold text-accent/50">
											TM
										</span>
										<div className="leading-tight">
											<p className="text-sm font-semibold text-ink">
												Di Redazione
											</p>
											<p className="text-xs">
												<Date value={post.publishDate} />
												{' \u2022 '}
												<ReadTime value={post.readTime} />
											</p>
										</div>
									</>
								)}
							</div>

							<ShareBar title={post.title} />
						</div>
					</header>

					{/* Hero image */}
					{post.metadata.image && (
						<figure className="mt-8 overflow-hidden rounded-xl bg-surface">
							<Img
								className="aspect-video w-full object-cover"
								image={post.metadata.image}
								width={900}
								alt={post.title}
								loading="eager"
								fetchPriority="high"
							/>
						</figure>
					)}

					{/* Mobile: collapsible TOC */}
					<div className="mt-6 space-y-3 lg:hidden">
						{showTOC && (
							<details className="group rounded-xl border border-line bg-surface">
								<summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-sm font-bold uppercase tracking-wider text-brand">
									Indice dei contenuti
									<ChevronIcon
										direction="right"
										className="size-4 rotate-90 text-brand transition-transform group-open:rotate-270"
									/>
								</summary>
								<div className="px-4 pb-4">
									<hr className="mb-3 border-line" />
									<TableOfContents headings={post.headings} />
								</div>
							</details>
						)}
					</div>

					{/* Body */}
					<div className="mt-10">
						<PostBody post={post} />
					</div>

					{/* Related Topics: categories + tags */}
					{(post.categories?.length || post.tags?.length) ? (
						<nav aria-label="Argomenti correlati" className="mt-8 space-y-3">
							<h2 className="text-xs font-bold uppercase tracking-widest text-muted">
								Argomenti correlati
							</h2>
							<div className="flex flex-wrap gap-2">
								{post.categories?.map((cat) => (
									<Link
										key={cat._id}
										href={`/${cat.slug.current}`}
										className="inline-flex items-center rounded-full border border-brand/30 bg-brand/5 px-3 py-1 text-xs font-semibold text-brand transition hover:bg-brand/10"
									>
										{cat.title}
									</Link>
								))}
								{post.tags?.map((tag) => (
									<Link
										key={tag._id}
										href={`/?tag=${tag.slug.current}`}
										className="inline-flex items-center rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-muted transition hover:border-brand hover:text-brand"
									>
										#{tag.title}
									</Link>
								))}
							</div>
						</nav>
					) : null}

					{/* Share footer */}
					<ShareBarFooter title={post.title} />

					{/* Scritto da */}
					<div className="mt-10">
						<h2 className="mb-4 text-xl font-extrabold text-ink sm:text-2xl">
							Scritto da
						</h2>
						<div className="rounded-xl border border-line bg-surface p-5 shadow-[0_10px_30px_rgba(0,0,0,0.35)] sm:p-6">
							<div className="flex gap-4">
								<span className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-full bg-brand text-lg font-bold text-brand-foreground sm:size-20">
									{firstAuthor?.image ? (
										<Img
											className="size-full rounded-full object-cover"
											image={firstAuthor.image}
											width={160}
											alt={firstAuthor.name}
										/>
									) : (
										getInitials(firstAuthor?.name ?? 'Redazione')
									)}
								</span>
								<div className="min-w-0">
									<p className="text-lg font-bold text-ink">
										{firstAuthor?.slug?.current ? (
											<Link
												href={`/autori/${firstAuthor.slug.current}`}
												className="hover:text-brand hover:underline"
											>
												{firstAuthor.name}
											</Link>
										) : (
											firstAuthor?.name ?? 'Redazione'
										)}
									</p>
									{firstAuthor?.articleCount && firstAuthor.articleCount > 0 && (
										<p className="mt-0.5 text-sm font-medium text-accent">
											{firstAuthor.articleCount} {firstAuthor.articleCount === 1 ? 'Articolo' : 'Articoli'}
										</p>
									)}
									{firstAuthor?.socialLink && (
										<a
											href={firstAuthor.socialLink}
											target="_blank"
											rel="noopener noreferrer"
											className="mt-2 inline-grid size-8 place-items-center rounded border border-line text-muted transition hover:border-accent hover:text-accent"
											aria-label="Profilo social"
										>
											<AuthorSocialIcon url={firstAuthor.socialLink} />
										</a>
									)}
								</div>
							</div>
							{firstAuthor?.bio && (
								<p className="mt-4 text-sm leading-relaxed text-muted">
									{firstAuthor.bio}
								</p>
							)}
						</div>
					</div>

					{/* Mobile: Related posts */}
					<div className="mt-10 lg:hidden">
						<Suspense fallback={<RelatedPostsSkeleton />}>
							<RelatedPosts post={post} variant="full" />
						</Suspense>
					</div>

					{/* Footer nav */}
					{post.categories?.[0] && (
						<div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
							<Link
								href={`/${post.categories[0].slug.current}`}
								className="inline-flex items-center gap-2 text-sm text-brand hover:underline"
							>
								<ChevronIcon direction="left" />
								{post.categories[0].title}
							</Link>

							{post.nextPost && (
								<Link
									href={`/${post.categories[0].slug.current}/${post.nextPost.slug}`}
									className="group inline-flex max-w-full items-center gap-2 text-right text-sm text-brand hover:underline"
								>
									<span className="min-w-0">
										<span className="block text-xs font-semibold uppercase tracking-wider text-muted">
											Articolo successivo
										</span>
										<span className="block truncate font-medium">
											{post.nextPost.title}
										</span>
									</span>
									<ChevronIcon direction="right" className="shrink-0" />
								</Link>
							)}
						</div>
					)}
				</div>

				{/* Sidebar (desktop only) */}
				<aside className="hidden space-y-6 lg:sticky-below-header lg:block lg:self-start lg:[--offset:1rem]">
					{showTOC && (
						<SectionCard className="p-5 sm:p-6">
							<TableOfContents headings={post.headings} />
						</SectionCard>
					)}

					<Suspense fallback={<RelatedPostsSkeleton />}>
						<RelatedPosts post={post} variant="sidebar" />
					</Suspense>
				</aside>
			</div>
		</article>
	)
}

function getBannerInsertIndex(
	body: Sanity.BlogPost['body'],
	position: Sanity.PreferredSourceBanner['position'],
): number {
	if (position === 'end') return body.length
	if (position === 'middle') return Math.floor(body.length / 2)

	// Default: after first paragraph block
	const idx = body.findIndex(
		(b) => b._type === 'block' && (!b.style || b.style === 'normal'),
	)
	return idx === -1 ? 1 : idx + 1
}

function PostBody({ post }: { post: Sanity.BlogPost }) {
	const banner = post.preferredSourceBanner
	const showBanner = banner?.enabled !== false

	if (!showBanner) {
		return (
			<Content value={post.body} className={cn(css.body, 'grid')} autoLink>
				<hr />
			</Content>
		)
	}

	const insertAt = getBannerInsertIndex(post.body, banner?.position)
	const before = post.body.slice(0, insertAt)
	const after = post.body.slice(insertAt)

	return (
		<>
			<Content value={before} className={cn(css.body, 'grid')} autoLink />
			<GooglePreferredSourceBanner />
			<Content value={after} className={cn(css.body, 'grid')} autoLink>
				<hr />
			</Content>
		</>
	)
}
