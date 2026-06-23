import { notFound } from 'next/navigation'
import groq from 'groq'
import { client } from '@/sanity/lib/client'
import { fetchSanityLive } from '@/sanity/lib/fetch'
import { IMAGE_QUERY } from '@/sanity/lib/queries'
import { BASE_URL } from '@/lib/env'
import { personJsonLd, breadcrumbJsonLd } from '@/lib/jsonLd'
import { Img } from '@/ui/primitives/Img'
import { urlFor } from '@/sanity/lib/image'
import PostPreview from '@/ui/modules/blog/PostPreview'
import { getSocialIcon } from '@/ui/primitives/SocialIcons'
import type { Metadata } from 'next'

function AuthorSocialIcon({ url }: { url: string }) {
	const Icon = getSocialIcon(url)
	return <Icon className="size-4" />
}

interface AuthorWithPosts extends Sanity.Person {
	posts: Sanity.BlogPost[]
}

async function getAuthor(slug: string): Promise<AuthorWithPosts | null> {
	return fetchSanityLive<AuthorWithPosts>({
		query: groq`*[_type == 'person' && slug.current == $slug][0]{
			...,
			'posts': *[_type == 'blog.post' && ^._id in authors[]._ref]|order(publishDate desc){
				_type,
				_id,
				'title': coalesce(title, metadata.title),
				featured,
				categories[]->,
				authors[]->,
				publishDate,
				'readTime': round(length(pt::text(body)) / 5 / 180),
				metadata {
					...,
					image { ${IMAGE_QUERY} }
				},
			}
		}`,
		params: { slug },
	})
}

type Props = {
	params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { slug } = await params
	const author = await getAuthor(slug)
	if (!author) return {}

	const title = `${author.name} — Autore | TRM Sport`
	const description =
		author.bio ||
		`Articoli e approfondimenti di ${author.name} su TRM Sport.`
	const url = `${BASE_URL}/autori/${slug}`

	const ogImage = author.image?.asset
		? { url: urlFor(author.image).width(1200).height(630).url(), width: 1200, height: 630 }
		: undefined

	return {
		metadataBase: new URL(BASE_URL),
		title,
		description,
		robots: { index: true, follow: true },
		openGraph: {
			type: 'profile',
			url,
			title,
			description,
			siteName: 'TRM Sport',
			locale: 'it_IT',
			...ogImage && { images: ogImage },
		},
		twitter: {
			card: 'summary_large_image',
			title,
			description,
			...ogImage && { images: [ogImage.url] },
		},
		alternates: {
			canonical: url,
		},
	}
}

export async function generateStaticParams() {
	const authors = await client.fetch<{ slug: string }[]>(
		groq`*[_type == 'person' && defined(slug.current)]{ 'slug': slug.current }`,
	)
	return authors.map(({ slug }) => ({ slug }))
}

export default async function AuthorPage({ params }: Props) {
	const { slug } = await params
	const author = await getAuthor(slug)
	if (!author) notFound()

	const authorUrl = `${BASE_URL}/autori/${slug}`

	return (
		<>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(personJsonLd(author)),
				}}
			/>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(
						breadcrumbJsonLd([
							{ name: 'Home', url: BASE_URL },
							{ name: 'Autori', url: `${BASE_URL}/autori` },
							{ name: author.name, url: authorUrl },
						]),
					),
				}}
			/>

			<div className="section space-y-12">
				{/* Author profile */}
				<header className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
					<span className="grid size-24 shrink-0 place-items-center overflow-hidden rounded-full bg-brand text-2xl font-bold text-brand-foreground sm:size-32">
						{author.image ? (
							<Img
								className="size-full rounded-full object-cover"
								image={author.image}
								width={256}
								alt={author.name}
							/>
						) : (
							author.name
								.split(' ')
								.map((w) => w[0])
								.join('')
								.slice(0, 2)
								.toUpperCase()
						)}
					</span>

					<div className="space-y-3">
						<h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
							{author.name}
						</h1>

						{author.bio && (
							<p className="max-w-xl text-base leading-relaxed text-muted">
								{author.bio}
							</p>
						)}

						<div className="flex items-center justify-center gap-3 sm:justify-start">
							{author.posts?.length > 0 && (
								<span className="text-sm font-semibold text-brand">
									{author.posts.length}{' '}
									{author.posts.length === 1
										? 'Articolo'
										: 'Articoli'}
								</span>
							)}

							{author.socialLink && (
								<a
									href={author.socialLink}
									target="_blank"
									rel="noopener noreferrer"
									className="inline-grid size-9 place-items-center rounded-full border border-line text-muted transition hover:border-brand hover:text-brand"
									aria-label="Profilo social"
								>
									<AuthorSocialIcon url={author.socialLink} />
								</a>
							)}
						</div>
					</div>
				</header>

				{/* Articles */}
				{author.posts?.length > 0 && (
					<section>
						<h2 className="mb-6 text-xs font-bold uppercase tracking-widest text-muted">
							Articoli di {author.name}
						</h2>
						<ul className="grid gap-x-8 gap-y-12 sm:grid-cols-[repeat(auto-fill,minmax(300px,1fr))]">
							{author.posts.map((post) => (
								<li key={post._id}>
									<PostPreview post={post} />
								</li>
							))}
						</ul>
					</section>
				)}
			</div>
		</>
	)
}
