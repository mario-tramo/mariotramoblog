import { createClient, type SanityClient } from '@sanity/client'
import { config } from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
config({ path: resolve(__dirname, '../../.env.local') })

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'geqdctr3'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const token = process.env.SANITY_API_WRITE_TOKEN

if (!token) {
  console.error('❌ SANITY_API_WRITE_TOKEN required')
  process.exit(1)
}

const client: SanityClient = createClient({
  projectId,
  dataset,
  token,
  apiVersion: '2025-01-01',
  useCdn: false,
})

async function runPatches<T>(label: string, items: T[], fn: (item: T) => { id: string; patches: Record<string, unknown> } | null) {
  const BATCH_SIZE = 50
  let total = 0
  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE)
    const tx = client.transaction()
    let count = 0
    for (const item of batch) {
      const result = fn(item)
      if (result) {
        tx.patch(result.id, (p: any) => p.set(result.patches))
        count++
      }
    }
    if (count > 0) {
      await tx.commit()
      total += count
    }
  }
  if (total > 0) {
    console.log(`   ✅ ${label}: ${total} documenti aggiornati`)
  } else {
    console.log(`   ✅ ${label}: nessun intervento necessario`)
  }
}

async function main() {
  console.log('🔍 Analisi e fix dei problemi SEO esistenti...\n')

  // 1. Fix duplicate slug "chi-siamo"
  console.log('--- 1. Slug duplicato: chi-siamo ---')
  const chiSiamoPages: { _id: string; title: string; _updatedAt: string }[] = await client.fetch(`
    *[_type == 'page' && metadata.slug.current == 'chi-siamo' && !(_id in path("drafts.**"))]{
      _id, title, _updatedAt
    }
  `)
  console.log(`   Trovate ${chiSiamoPages.length} pagine con slug "chi-siamo"`)
  if (chiSiamoPages.length > 1) {
    const [keep, rename] = chiSiamoPages
    console.log(`   ➜ Mantengo "${keep.title}" (${keep._id}) come /chi-siamo`)
    console.log(`   ➜ Rinomino "${rename.title}" (${rename._id}) in /chi-siamo-2`)
    await client.patch(rename._id).set({ 'metadata.slug': { _type: 'slug', current: 'chi-siamo-2' } }).commit()
    console.log('   ✅ Slug duplicato risolto')
  } else {
    console.log('   ✅ Nessun conflitto')
  }

  // 2. Fix categories without metadata
  console.log('\n--- 2. Categorie senza metadata ---')
  const catsNoMeta: { _id: string; title: string; slug: string }[] = await client.fetch(`
    *[_type == 'blog.category' && !defined(metadata) && !(_id in path("drafts.**"))]{
      _id, title, "slug": slug.current
    }
  `)
  console.log(`   Trovate ${catsNoMeta.length} categorie senza metadata`)
  await runPatches('Metadata categorie', catsNoMeta, (cat) => ({
    id: cat._id,
    patches: {
      metadata: {
        _type: 'metadata',
        slug: { _type: 'slug', current: cat.slug },
        title: `${cat.title} — Notizie, risultati e approfondimenti | TRM Sport`,
        description: `${cat.title}: notizie, risultati e approfondimenti. Tutti gli aggiornamenti sul mondo di ${cat.title} con analisi e commenti.`.slice(0, 170),
        noIndex: false,
        keywords: [cat.title.toLowerCase()],
      },
    },
  }))

  // 3. Fix missing alt text on images
  console.log('\n--- 3. Immagini senza alt text ---')
  const postsWithMissingAlt: { _id: string; title: string }[] = await client.fetch(`
    *[_type == 'blog.post' && defined(metadata.image) && !defined(metadata.image.alt) && !(_id in path("drafts.**"))]{
      _id, title
    }
  `)
  console.log(`   Trovati ${postsWithMissingAlt.length} post con alt text mancante`)
  await runPatches('Alt text', postsWithMissingAlt, (post) => ({
    id: post._id,
    patches: { 'metadata.image.alt': post.title ? `${post.title} — immagine di copertina` : 'Immagine di copertina' },
  }))

  // 4. Fix invalid slug characters (uppercase)
  console.log('\n--- 4. Slug con caratteri maiuscoli ---')
  const invalidSlugs: { _id: string; title: string; slug: string }[] = await client.fetch(`
    *[_type == 'blog.post' && defined(metadata.slug.current) && metadata.slug.current match "*[A-Z]*" && !(_id in path("drafts.**"))]{
      _id, title, "slug": metadata.slug.current
    }
  `)
  console.log(`   Trovati ${invalidSlugs.length} slug con maiuscole`)
  await runPatches('Slug lowercase', invalidSlugs, (post) => {
    const newSlug = post.slug.toLowerCase()
    if (newSlug !== post.slug) {
      console.log(`   ➜ "${post.slug}" → "${newSlug}"`)
      return { id: post._id, patches: { 'metadata.slug.current': newSlug } }
    }
    return null
  })

  // 5. Fix short SEO titles
  console.log('\n--- 5. Title SEO troppo corti (< 30 caratteri) ---')
  const shortTitles: { _id: string; _type: string; title: string; metaTitle: string; metaTitleLen: number }[] = await client.fetch(`
    *[_type in ['page', 'blog.post', 'blog.category', 'legal']
      && defined(metadata.title)
      && string::length(metadata.title) < 30
      && !(_id in path("drafts.**"))
    ]{
      _id, _type, title, "metaTitle": metadata.title, "metaTitleLen": string::length(metadata.title)
    }
  `)
  console.log(`   Trovati ${shortTitles.length} title troppo corti`)
  await runPatches('Title SEO', shortTitles, (doc) => {
    const suggested = doc.title
      ? `${doc.title} — Notizie e approfondimenti | TRM Sport`
      : 'TRM Sport — Notizie sportive, risultati e approfondimenti'
    const newTitle = suggested.length > 70 ? suggested.slice(0, 67) + '...' : suggested
    if (newTitle.length >= 30 && newTitle !== doc.metaTitle) {
      console.log(`   ➜ "${doc.metaTitle}" (${doc.metaTitleLen}) → "${newTitle}" (${newTitle.length})`)
      return { id: doc._id, patches: { 'metadata.title': newTitle } }
    }
    return null
  })

  // 6. Report short descriptions (can't auto-fix well)
  console.log('\n--- 6. Description SEO troppo corte (< 120 caratteri) ---')
  const shortDescs: { _id: string; _type: string; title: string; desc: string; descLen: number }[] = await client.fetch(`
    *[_type in ['page', 'blog.post', 'blog.category', 'legal']
      && defined(metadata.description)
      && string::length(metadata.description) < 120
      && !(_id in path("drafts.**"))
    ]{
      _id, _type, title,
      "desc": metadata.description,
      "descLen": string::length(metadata.description)
    } | order(descLen asc)
  `)
  console.log(`   ⚠ ${shortDescs.length} description troppo corte — richiedono intervento manuale`)
  console.log('   | type | title | descLen | current |')
  console.log('   |------|-------|---------|---------|')
  for (const d of shortDescs.slice(0, 10)) {
    console.log(`   | ${d._type} | ${(d.title || '').slice(0, 40)} | ${d.descLen} | ${(d.desc || '').slice(0, 60)}... |`)
  }
  if (shortDescs.length > 10) {
    console.log(`   | ... e altre ${shortDescs.length - 10} description |`)
  }

  // 7. Report posts without authors
  console.log('\n--- 7. Post senza autori ---')
  const noAuthorPosts = await client.fetch(`
    count(*[_type == 'blog.post' && (!defined(authors) || count(authors) == 0) && !(_id in path("drafts.**"))])
  `)
  console.log(`   ⚠ ${noAuthorPosts} post senza autore — richiedono intervento manuale via Sanity Studio`)

  // 8. Report posts without tags
  console.log('\n--- 8. Post senza tag ---')
  const noTagPosts = await client.fetch(`
    count(*[_type == 'blog.post' && (!defined(tags) || count(tags) == 0) && !(_id in path("drafts.**"))])
  `)
  console.log(`   ⚠ ${noTagPosts} post senza tag — richiedono intervento manuale via Sanity Studio`)

  console.log('\n✅ Fix completati!')
  console.log(`📊 Riepilogo:`)
  console.log(`   • Slug duplicati: risolti`)
  console.log(`   • Categorie senza metadata: ${catsNoMeta.length} risolte`)
  console.log(`   • Alt text mancanti: ${postsWithMissingAlt.length} risolti`)
  console.log(`   • Slug maiuscoli: ${invalidSlugs.length} risolti`)
  console.log(`   • Title corti: ${shortTitles.length} gestiti`)
  console.log(`   • Description corte: ${shortDescs.length} richiedono revisione manuale`)
  console.log(`   • Post senza autore: ${noAuthorPosts} richiedono intervento manuale`)
  console.log(`   • Post senza tag: ${noTagPosts} richiedono intervento manuale`)
  console.log(`\n💡 Per description, autori e tag, usa Sanity Studio per compilare i campi mancanti.`)
}

main().catch((err) => {
  console.error('❌ Errore:', err)
  process.exit(1)
})
