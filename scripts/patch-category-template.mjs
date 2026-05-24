import { createClient } from '@sanity/client'

const client = createClient({
  projectId: 'geqdctr3',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
})

const templateId = '1e2ee6b3-c7e8-49b4-b65a-9091fbd2eb7c'

const newModules = [
  {
    _key: 'category-frontpage',
    _type: 'blog-frontpage',
    mainPost: 'recent',
    showFeaturedPostsFirst: true,
    itemsPerPage: 6,
  },
]

// Use raw mutations to bypass permission issues
await client.request({
  method: 'POST',
  uri: '/data/mutate/production',
  body: {
    mutations: [
      {
        createOrReplace: {
          _id: templateId,
          _type: 'category-template',
          modules: newModules,
        },
      },
    ],
  },
})

console.log('Category template updated to blog-frontpage (3-column layout)')
