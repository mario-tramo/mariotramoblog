import { notFound } from 'next/navigation'
import Modules from '@/ui/modules'
import processMetadata from '@/lib/processMetadata'
import { blogPostingJsonLd, breadcrumbJsonLd, personJsonLd } from '@/lib/jsonLd'
import { client } from '@/sanity/lib/client'
import { fetchSanityLive } from '@/sanity/lib/fetch'
import { groq } from 'next-sanity'
import { BASE_URL, BLOG_DIR } from '@/lib/env'
import {
	IMAGE_QUERY,
	TRANSLATIONS_QUERY,
} from '@/sanity/lib/queries'
import { languages, type Lang } from '@/lib/i18n'

export default async function Page({ params }: Props) {
	const post = await getPost(await params)
	if (!post) notFound()
	return (
		<>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(blogPostingJsonLd(post)),
				}}
			/>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(
						breadcrumbJsonLd([
							{ name: 'Home', url: BASE_URL },
							{ name: 'Blog', url: `${BASE_URL}/${BLOG_DIR}` },
							{
								name: post.metadata.title,
								url: `${BASE_URL}/${BLOG_DIR}/${post.metadata.slug.current}`,
							},
						]),
					),
				}}
			/>
			{post.authors?.map((author) => (
				<script
					key={author._id}
					type="application/ld+json"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd(author)) }}
				/>
			))}
			<Modules modules={post.modules} post={post} />
		</>
	)
}

export async function generateMetadata({ params }: Props) {
	const post = await getPost(await params)
	if (!post) notFound()
	return processMetadata(post)
}

export async function generateStaticParams() {
	const slugs = await client.fetch<string[]>(
		groq`*[_type == 'blog.post' && defined(metadata.slug.current)].metadata.slug.current`,
	)

	return slugs.map((slug) => ({ slug: slug.split('/') }))
}

async function getPost(params: Params) {
	const { slug, lang } = processSlug(params)

	return await fetchSanityLive<Sanity.BlogPost & { modules: Sanity.Module[] }>({
		query: groq`*[
			_type == 'blog.post'
			&& metadata.slug.current == $slug
			${lang ? `&& language == '${lang}'` : ''}
		][0]{
			...,
			body[]{
				...,
				_type == 'image' => {
					${IMAGE_QUERY},
					asset->
				}
			},
			'readTime': length(string::split(pt::text(body), ' ')) / 200,
			'headings': body[style in ['h2', 'h3']]{
				style,
				'text': pt::text(@)
			},
			categories[]->,
			'authors': select(defined(author) => [author->{
				...,
				'articleCount': count(*[_type == 'blog.post' && author._ref == ^._id])
			}], null),
			metadata {
				...,
				'ogimage': image.asset->url + '?w=1200'
			},
			${TRANSLATIONS_QUERY},
		}`,
		params: { slug },
	})
}

type Params = { slug: string[] }

type Props = {
	params: Promise<Params>
}

function processSlug(params: Params) {
	const lang = languages.includes(params.slug[0] as Lang)
		? params.slug[0]
		: undefined

	const slug = params.slug.join('/')

	return {
		slug: lang ? slug.replace(new RegExp(`^${lang}/`), '') : slug,
		lang,
	}
}
