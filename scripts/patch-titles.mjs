import { createClient } from '@sanity/client'

const client = createClient({
  projectId: 'geqdctr3',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
})

const posts = await client.fetch(
  `*[_type == 'blog.post' && !defined(title) && !(_id in path("drafts.**"))]{_id, "metaTitle": metadata.title}`,
)

console.log(`Found ${posts.length} posts missing title`)

for (const post of posts) {
  if (!post.metaTitle) {
    console.log(`  SKIP ${post._id} — no metadata.title either`)
    continue
  }
  await client.request({
    method: 'POST',
    uri: '/data/mutate/production',
    body: {
      mutations: [{ patch: { id: post._id, set: { title: post.metaTitle } } }],
    },
  })
  console.log(`  OK ${post._id} → "${post.metaTitle}"`)
}

console.log('Done!')
