/**
 * Migration (batch 2): delete the remaining 20 AI-generated seed posts.
 *
 * The first pass (delete-seed-posts.mjs) removed the 69 posts flagged noIndex
 * in the 2026-08-04 GSC audit. These 20 were created in the same seed window
 * (2026-05-09 → 2026-05-27, before real publishing started on 2026-06-09) but
 * were never flagged noIndex, so the first script skipped them. Confirmed for
 * deletion on 2026-08-04, including the longer fantacalcio guide.
 *
 * The target list is pinned by document ID. Before deleting, each document is
 * re-verified (blog.post, created before 2026-06-01, no inbound references) —
 * anything that fails a check is skipped and reported.
 *
 * Usage:
 *   SANITY_API_WRITE_TOKEN=... node scripts/delete-seed-posts-batch2.mjs           # dry run
 *   SANITY_API_WRITE_TOKEN=... node scripts/delete-seed-posts-batch2.mjs --execute # delete
 */
import { createClient } from '@sanity/client'

const EXECUTE = process.argv.includes('--execute')

const client = createClient({
	projectId: 'geqdctr3',
	dataset: 'production',
	apiVersion: '2024-01-01',
	useCdn: false,
	token: process.env.SANITY_API_WRITE_TOKEN,
})

// Pinned targets: every blog.post created before 2026-06-01 as of 2026-08-04.
const SEED_POSTS = [
	{ id: 'eb590744-6707-4f97-80c9-92d196dc888e', slug: 'guida-finale-champions-league-2026-milano' },
	{ id: '20420ee5-ba11-4e5e-8862-e2153648743b', slug: 'derby-inter-milan-3-1-serie-a-2026' },
	{ id: 'c644e7a2-6e55-4cfb-86b9-5ebbd8446131', slug: 'ferrari-nuova-ala-anteriore-sf26' },
	{ id: 'cb08635e-019c-4daf-be8e-982a073e326b', slug: 'milan-colpo-premier-nuovo-numero-10' },
	{ id: '44f83f62-6f8a-47ef-af03-ce19b86ff9b7', slug: 'guida-al-fantacalcio-la-strategia-vincente-per-il-successo' },
	{ id: '9044e25e-8b29-481e-a9be-1744fbc25046', slug: 'juventus-torino-2-0-bianconeri-vittoria' },
	{ id: 'fbae2759-d86e-45af-a65f-8e61a1eceb24', slug: 'var-polemiche-serie-a' },
	{ id: '3e037d30-de5b-4958-9440-6ba5169e7d37', slug: 'calciomercato-milan-gyokeres-60-milioni' },
	{ id: '59fde922-3f27-4f97-87e1-b2d14e678645', slug: 'calciomercato-zubimendi-juventus-ufficiale' },
	{ id: '68185bc6-f9c1-479d-8684-90d9c60b9625', slug: 'atp-stoccarda-berrettini-vittoria-top-20' },
	{ id: 'a8a18306-de04-4c19-af21-0829c034d9f2', slug: 'wimbledon-musetti-semifinale-record' },
	{ id: 'a900617e-1ae9-406c-98aa-76cd031d80bc', slug: 'wta-roma-paolini-top-5-mondiale' },
	{ id: '25bfca99-871b-4859-bc11-4ebebff98f51', slug: 'ferrari-sf-27-presentazione-maranello' },
	{ id: '677e5994-4f15-49fc-8060-8f25f500acfe', slug: 'f1-gp-silverstone-norris-mclaren' },
	{ id: '95556cde-7b23-447d-a1dc-c1f1e9564bbb', slug: 'f1-verstappen-quarto-titolo-mondiale' },
	{ id: 'af5b08e8-e165-4edb-bd9b-dc970c5b29e5', slug: 'motogp-barcellona-martin-bagnaia' },
	{ id: 'c1182cbb-7859-41fd-acbc-cbd44b05985c', slug: 'f1-hamilton-test-fiorano-ferrari' },
	{ id: 'ced3ba8d-a00e-42e3-a251-4c9b599d368c', slug: 'motogp-austin-marquez-vittoria-rimonta' },
	{ id: '940699c9-6c1e-4748-931b-20fa8eca7dbf', slug: 'analisi-tattica-pressing-napoli-conte' },
	{ id: '982b15cc-5f2f-4a07-9268-578efe9b3d05', slug: 'eurolega-panathinaikos-finale-real-eliminato' },
]

const ids = SEED_POSTS.map((p) => p.id)

const docs = await client.fetch(
	`*[_id in $ids]{
		_id,
		_type,
		_createdAt,
		"slug": metadata.slug.current,
		"referencedBy": *[references(^._id) && !(_id in path("drafts.**"))]{ _id, _type }
	}`,
	{ ids },
)
const byId = new Map(docs.map((d) => [d._id, d]))

const deletable = []
const skipped = []

for (const target of SEED_POSTS) {
	const doc = byId.get(target.id)
	if (!doc) {
		skipped.push({ ...target, reason: 'not found (already deleted?)' })
		continue
	}
	if (doc._type !== 'blog.post') {
		skipped.push({ ...target, reason: `unexpected type "${doc._type}"` })
		continue
	}
	if (doc._createdAt >= '2026-06-01') {
		skipped.push({ ...target, reason: `created ${doc._createdAt} — outside the seed window` })
		continue
	}
	if (doc.referencedBy.length > 0) {
		const refs = doc.referencedBy.map((r) => `${r._type} ${r._id}`).join(', ')
		skipped.push({ ...target, reason: `referenced by: ${refs}` })
		continue
	}
	deletable.push(target)
}

console.log(`${EXECUTE ? 'EXECUTE' : 'DRY RUN'} — ${deletable.length} to delete, ${skipped.length} skipped\n`)

for (const s of skipped) console.log(`  SKIP  ${s.slug}\n        ${s.reason}`)
for (const d of deletable) console.log(`  DEL   ${d.slug}`)

if (!EXECUTE) {
	console.log('\nDry run only. Re-run with --execute to delete.')
	process.exit(0)
}

if (deletable.length === 0) {
	console.log('\nNothing to delete.')
	process.exit(0)
}

// Delete published + draft versions in batched transactions.
const BATCH = 20
for (let i = 0; i < deletable.length; i += BATCH) {
	const batch = deletable.slice(i, i + BATCH)
	const tx = client.transaction()
	for (const { id } of batch) {
		tx.delete(id)
		tx.delete(`drafts.${id}`)
	}
	await tx.commit({ visibility: 'async' })
	console.log(`\nDeleted ${Math.min(i + BATCH, deletable.length)}/${deletable.length}`)
}

console.log('\nDone. Remember: the sitemap revalidates within 1h; deleted URLs will start returning 404.')
