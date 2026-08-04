/**
 * Migration: delete the 69 seed/demo blog posts left over from development.
 *
 * These posts were bulk-created on 2026-05-09/11/27 with 300–1000 chars of
 * placeholder content and were blocking site-wide indexing (GSC audit
 * 2026-08-04). They were first hidden with metadata.noIndex = true; this
 * script removes them permanently.
 *
 * The target list is pinned by document ID so re-running the script can never
 * touch posts the editors flag noIndex in the future. Before deleting, each
 * document is re-verified against the same criteria used in the audit
 * (blog.post, noIndex === true, body < 1500 chars) and checked for inbound
 * references — anything that fails a check is skipped and reported.
 *
 * Usage:
 *   SANITY_API_WRITE_TOKEN=... node scripts/delete-seed-posts.mjs           # dry run
 *   SANITY_API_WRITE_TOKEN=... node scripts/delete-seed-posts.mjs --execute # delete
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

// Pinned targets from the 2026-08-04 GSC indexing audit.
const SEED_POSTS = [
	{ id: '8bd9d61e-62ce-4a4d-8990-2e4860a2fbfd', slug: '10-gol-piu-belli-stagione-serie-a' },
	{ id: '52321144-464c-45e9-b6b8-41ba1ea8add4', slug: 'atalanta-fiorentina-4-1-lookman-tripletta' },
	{ id: '6135f6dc-94cc-4e4b-a204-1947a13b26bb', slug: 'atp-madrid-alcaraz-djokovic-terra' },
	{ id: 'b1e8573d-93d8-4ea3-99a2-bd9d9009507c', slug: 'australian-open-sinner-bis-medvedev' },
	{ id: '322d352b-defb-472b-9083-4a09a9718003', slug: 'basket-olimpia-milano-scudetto-bologna' },
	{ id: 'cc071084-2429-455d-81da-4215385ad446', slug: 'betting-quote-champions-league-favorite' },
	{ id: '7c4080db-1e86-40fe-8b59-fa15b8b888d4', slug: 'betting-quote-scudetto-serie-a' },
	{ id: '2ee39f2d-2068-4186-b53c-750d4442cb6d', slug: 'bologna-monza-2-0-zona-europa' },
	{ id: '3d4111f7-1c01-48b6-9072-6f26fdad9318', slug: 'bundesliga-bayern-campione-dortmund' },
	{ id: '2090a3f3-9585-4fb0-9ff6-c968efbc9159', slug: 'bundesliga-leverkusen-imbattuto-xabi-alonso' },
	{ id: '31e97f0c-312a-4ee2-aeca-760f91507574', slug: 'calciomercato-inter-barella-rinnovo-2030' },
	{ id: '9aca2546-6988-4ddc-a348-cb346122d313', slug: 'calciomercato-juventus-osimhen-obiettivo-estate' },
	{ id: '87940e8a-2215-430f-b65c-702841369525', slug: 'calciomercato-roma-rivoluzione-estiva' },
	{ id: '283a9625-f726-48ef-bf87-7896a1fc075a', slug: 'champions-barcellona-dortmund-0-3' },
	{ id: 'fa8732e9-0dd6-42b8-9ea6-36e837f2cd16', slug: 'champions-inter-psg-2-1-ottavi' },
	{ id: '4027b606-891e-4f1c-9fc9-1f3c7578bc18', slug: 'champions-league-2026-milan-semifinale' },
	{ id: '90e35b51-a4cf-4a2d-af36-4c13bbd14997', slug: 'champions-league-sorprese-quarti-finale' },
	{ id: '19af492c-38e9-4978-970a-8c7cf36629ef', slug: 'champions-liverpool-rimonta-atletico' },
	{ id: 'f18626b5-87d9-4a5e-9de6-b916de5c9e77', slug: 'champions-real-madrid-semifinale-city-eliminato' },
	{ id: 'a0b5455c-f8ae-4666-a114-15992c3d546c', slug: 'champions-volley-perugia-trionfa-leon' },
	{ id: 'c9e08201-a6f6-4fa1-8f9c-0c7688788cd8', slug: 'coppa-davis-italia-campione-consecutiva' },
	{ id: '66a5d781-c029-4e71-a2ec-05b74fa02bb7', slug: 'derby-milano-milan-inter-2-1-leao' },
	{ id: '4d3b1356-3248-4dce-a03c-6e6c56a8e221', slug: 'difesa-a-3-basket-moderno-eurolega' },
	{ id: '36481608-ff8d-48ca-8345-3f1cd3082741', slug: 'f1-gp-imola-doppietta-ferrari' },
	{ id: '827caa62-f4e2-4f7f-bb65-e97b24f89196', slug: 'f1-gp-monaco-leclerc-ferrari-trionfo' },
	{ id: '66aaf2b1-02c2-44ac-a5bf-ba53f72f5f59', slug: 'fantacalcio-aste-riparazione-gennaio' },
	{ id: 'fc15688d-3840-48fc-893d-8c706b456cdb', slug: 'fantacalcio-consigli-giornata-30' },
	{ id: 'b6fb994f-d2b9-4951-aa29-bcda96ff5479', slug: 'fantacalcio-top-11-stagione' },
	{ id: '6471345e-9b18-402c-b746-68f7e56876fd', slug: 'finale-champions-2027-san-siro' },
	{ id: '291935bd-3c5a-4827-9632-02542f1740d1', slug: 'giro-italia-pogacar-trionfa-tour' },
	{ id: '98b5eb87-1ec8-4821-85a9-e667669cfb36', slug: 'inter-campione-inverno-cagliari' },
	{ id: 'e7ef3453-e27a-4e2e-a72a-620b683616c5', slug: 'kvaratskhelia-psg-cifre-affare-2026' },
	{ id: '2008a215-9e49-47a6-a03e-3908c4c5d177', slug: 'lazio-genoa-3-2-rimonta-olimpico' },
	{ id: '5468bab2-1b57-44d9-9b06-27bff1b9bdae', slug: 'liga-simeone-rinnovo-atletico-2028' },
	{ id: '29e47e74-ee5e-4420-8ac6-c3c5034054c6', slug: 'liga-yamal-tripletta-clasico-barca-real' },
	{ id: 'a774c159-8699-4560-8eb5-fa43c7fd4d52', slug: 'ligue-1-psg-campione-delusione-champions' },
	{ id: '93704e57-62bd-4c20-a9eb-43aeea955509', slug: 'milan-juventus-big-match-champions' },
	{ id: '1e587f49-4d1d-4d69-8abc-b700ea100f8e', slug: 'mma-primo-italiano-ufc-milano' },
	{ id: 'a9345b78-51d2-4e50-99b1-90cba4cdd72a', slug: 'motogp-mugello-bagnaia-gp-italia' },
	{ id: '6f30fca6-3577-491d-8c6c-4b842be8939e', slug: 'musetti-berrettini-derby-queens' },
	{ id: 'da958281-01b0-46b1-9b38-82e86bce7bf2', slug: 'napoli-campione-italia-terzo-scudetto' },
	{ id: 'cd5880f2-3a3a-4a52-9d70-1f0f22053cc4', slug: 'napoli-lazio-3-0-dominio-azzurro' },
	{ id: 'c812dd73-5a96-4eca-9065-82a627e9aab2', slug: 'nba-finals-2026-knicks-nuggets' },
	{ id: '0f2c80d4-7090-48f6-9966-3a41af093b44', slug: 'nba-playoffs-jokic-denver-rimonta-storica' },
	{ id: '6ad274b4-616c-439e-9ffe-bfae9800ecc1', slug: 'olimpia-milano-finale-scudetto-shields' },
	{ id: 'a6f580cf-edbe-450a-a564-17526517512a', slug: 'olimpiadi-los-angeles-2028-italia-50-medaglie' },
	{ id: 'a3e44282-0adc-4ff4-b5d9-b1b3f1eaa387', slug: 'opinione-calcio-italiano-cambiare-mentalita' },
	{ id: 'ba01bfde-85de-4771-87db-0afcfb186649', slug: 'opinione-sinner-alcaraz-rivalita-tennis' },
	{ id: 'a3913cac-4a1d-4f77-b94e-1f28d51cfe2b', slug: 'opinione-superlega-tradimento-sport' },
	{ id: '7ec9942e-1bae-48bd-abb0-e92a87aca108', slug: 'premier-arsenal-chelsea-ko' },
	{ id: '590cf0b1-6ea2-4bc7-a5a8-e65537f4bf42', slug: 'premier-manchester-united-crisi' },
	{ id: 'ca50f95d-d164-410d-a1cf-097d8e7f29f9', slug: 'premier-salah-200-gol-record' },
	{ id: '394fb303-8e9e-4ebc-a28c-629aec9baad6', slug: 'pressing-gasperini-atalanta-analisi-tattica' },
	{ id: '6fd122f5-579e-4ca2-bdb7-38c09c9bd5fe', slug: 'real-madrid-arsenal-rimonta-champions' },
	{ id: '88bf2440-0f89-4b71-94d2-0703f9a1292a', slug: 'roland-garros-sinner-alcaraz-career-slam' },
	{ id: '4b909d1c-2501-4517-9826-9ccc9d3fb16a', slug: 'roma-crisi-sconfitta-bologna' },
	{ id: 'f610385d-aa21-49f8-a2ae-d85ceb4210c4', slug: 'rugby-urc-zebre-parma-semifinale' },
	{ id: '9e29247d-e8fe-41a5-86b1-b8539fce3059', slug: 'sei-nazioni-italia-inghilterra-twickenham' },
	{ id: '5a64c4c4-e2e9-48c0-b54f-c1e0018a1c94', slug: 'sinner-conquista-roland-garros' },
	{ id: 'f54221fe-6219-41ff-9f37-673bcbf45443', slug: 'sport-ai-intelligenza-artificiale-calcio' },
	{ id: '733078b7-a907-4ea2-9e7b-90c2769c8d41', slug: 'stadi-italia-guida-piu-belli' },
	{ id: 'a07133e8-b8ba-405b-b584-d7a260f6c777', slug: 'super-league-idea-non-morira-mai' },
	{ id: 'b1b0b420-9dcc-4d1d-9f6c-08b3917ba630', slug: 'superlega-volley-milano-scudetto-rimonta' },
	{ id: 'f67894fd-ad92-4bf9-a9b2-084fc6fb9e0d', slug: 'tattiche-falso-9-atalanta-gasperini' },
	{ id: '637d68b5-ac3b-4f56-8713-d9e14097d7a3', slug: 'tattiche-marcatura-uomo-ritorno-serie-a' },
	{ id: 'eb4daa1d-b0ae-481a-ad3d-46e00915265b', slug: 'tennis-djokovic-ritiro-us-open-2026' },
	{ id: '9f6fdc10-7b4a-4ff4-8eac-62975a458876', slug: 'tour-france-van-der-poel-maglia-gialla' },
	{ id: 'f76b808a-fffb-4e35-85d1-fa45ecc81461', slug: 'var-uccide-emozione-calcio-opinione' },
	{ id: '60454d0f-8056-4274-99a1-54d174aedd72', slug: 'volley-italia-femminile-mondiale-egonu' },
]

const ids = SEED_POSTS.map((p) => p.id)

// Re-verify every target against the audit criteria and fetch inbound
// references, so a stale ID (deleted, repurposed, or rewritten since the
// audit) can never be deleted by accident.
const docs = await client.fetch(
	`*[_id in $ids]{
		_id,
		_type,
		"slug": metadata.slug.current,
		"noIndex": metadata.noIndex,
		"bodyLength": length(pt::text(body)),
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
	if (doc.noIndex !== true) {
		skipped.push({ ...target, reason: 'noIndex flag removed — editor may have rescued this post' })
		continue
	}
	if ((doc.bodyLength ?? 0) >= 1500) {
		skipped.push({ ...target, reason: `body grew to ${doc.bodyLength} chars — looks rewritten` })
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
