import groq from 'groq'

export const AUDIT_QUERY = groq`{
  "site": *[_id == 'site'][0]{
    title,
    'ogimage': ogimage.asset->url
  },
  "pages": *[_type == 'page' && !(_id in path("drafts.**"))]{
    _id,
    _type,
    _updatedAt,
    title,
    "url": select(
      metadata.slug.current == 'index' => '/',
      '/' + metadata.slug.current
    ),
    metadata {
      ...,
      "image": image{ ..., 'asset': asset->{url} }
    }
  },
  "posts": *[_type == 'blog.post' && !(_id in path("drafts.**"))]{
    _id,
    _type,
    _updatedAt,
    title,
    publishDate,
    "url": '/' + coalesce(categories[0]->slug.current, 'articolo') + '/' + metadata.slug.current,
    "categories": categories[]->{ _id, title, "slug": slug.current },
    "tags": tags[]->{ _id, title },
    "authors": authors[]->{ _id, name },
    "bodyLength": length(pt::text(body)),
    "bodyBlocks": count(body),
    metadata {
      ...,
      "image": image{ ..., 'asset': asset->{url} }
    }
  },
  "categories": *[_type == 'blog.category' && !(_id in path("drafts.**"))]{
    _id,
    _type,
    _updatedAt,
    title,
    "url": '/' + slug.current,
    metadata {
      ...,
      "image": image{ ..., 'asset': asset->{url} }
    }
  },
  "tags": *[_type == 'blog.tag' && !(_id in path("drafts.**"))]{
    _id,
    _type,
    title,
    "url": '/tag/' + slug.current,
    "slug": slug.current
  },
  "legal": *[_type == 'legal' && !(_id in path("drafts.**"))]{
    _id,
    _type,
    _updatedAt,
    "title": metadata.title,
    "url": '/legal/' + metadata.slug.current,
    metadata {
      ...,
      "image": image{ ..., 'asset': asset->{url} }
    }
  }
}`
