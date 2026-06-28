# Sanity Caching · Strategy & Operations

## TL;DR

Tutte le query Sanity pubblicate passano per **Next.js Data Cache** (`unstable_cache`).
Ogni query viene marcata con tag granulari (`sanity:type:*`, `sanity:slug:*`,
`sanity:doc:*`, più il globale `sanity`). Quando Sanity pubblica un documento,
il webhook chiama `/api/revalidate` che esegue `revalidateTag(tag, { expire: 0 })`
solo sui tag coinvolti — invalidazione chirurgica, niente full rebuild.

---

## Architettura

```
Browser → Next.js (Vercel)
         ├── Next.js Data Cache  ← unstable_cache(t={sanity, sanity:type:X, ...})
         │       MISS → Sanity useCdn (apicdn.sanity.io)
         │                  MISS → Sanity DB (api.sanity.io)
         │
         └── /api/revalidate (POST)
                 ← Sanity Webhook (HTTP POST)
```

- **Cache layer**: `src/sanity/lib/cache.ts` espone `buildTags()` (puro) e
  `tagsForDocument()` (per auto-derive lato server). Le alte chiamate
  usano **esclusivamente** `fetchSanityLive()` da `src/sanity/lib/fetch.ts`
  (next-sanity), che è già integrato con Next.js Data Cache. Il parametro
  `cacheHint: { type, id, slug }` arricchisce i tag in modo granulare.
  Non esiste più `cachedFetch()` — è stato rimosso come dead code.
- **Invalidation**: `src/app/api/revalidate/route.ts` accetta due modalità:
  `tags: string[]` espliciti, oppure `document: { _type, _id, slug }` da
  cui i tag sono derivati server-side via `tagsForDocument()`. In entrambi
  i casi viene flushato anche il tag globale `'sanity'` come failsafe.
- **Auth**: il segreto del webhook è passato come `x-revalidate-secret`
  header, `Authorization: Bearer`, o `?secret=` query. Tutte le rotte
  protette passano per `isAuthorized()` in `src/lib/http-auth.ts`
  (confronto constant-time via `safeEqual`).

---

## Tag strategy

| Tag | Quando viene emesso |
|---|---|
| `sanity` | Sempre (failsafe). Viene invalidato da QUALSIASI publish. |
| `sanity:type:<type>` | Una query i cui risultati sono (anche parzialmente) di un certo `_type`. |
| `sanity:slug:<slug>` | Una query parametrizzata per slug noto. |
| `sanity:doc:<id>` | Una query che restituisce un singolo documento. |
| `category:<slug>` | Una query la cui shape dipende dalla categoria URL. |
| `page:lang:<lang>` | Varianti localizzate della stessa pagina. |
| `site-config`, `translations` | Tag custom che i top-level helpers aggiungono. |

I callsite **non** ispezionano i risultati per derivare i tag: il chiamante
conosce lo shape della query e decide cosa invalidare.

---

## Sanity Webhook Configuration

Configura un webhook su [manage.sanity.io](https://manage.sanity.io) → API → Webhooks:

- **Name**: `Next.js revalidate`
- **URL**: `https://trmsport.com/api/revalidate`
- **Method**: `POST`
- **Trigger on**: `Create`, `Update`, `Delete`
- **Filter**: `_type in ["page", "blog.post", "blog.category", "person", "site", "legal", "announcement", "redirect"]`
- **Secret**: lo stesso valore di `REVALIDATE_SECRET` (header `x-revalidate-secret`)
- **Projection** (GROQ):

```groq
{
  'path': select(
    _type == 'blog.post' => '/' + coalesce(categories[0]->slug.current, '') + '/' + metadata.slug.current,
    _type == 'page' => '/' + select(metadata.slug.current == 'index' => '', metadata.slug.current),
    _type == 'blog.category' => '/' + slug.current,
    _type == 'person' => '/autori/' + slug.current,
    _type == 'site' => '/',
    _type == 'legal' => '/legal/' + metadata.slug.current,
    _type == 'announcement' => '/',
    _type == 'redirect' => '/',
    '/'
  ),
  'tags': [].concat(
    ['sanity'],
    ['sanity:type:' + _type],
    defined(metadata.slug.current) && _type != 'site' && _type != 'redirect' => ['sanity:slug:' + metadata.slug.current],
    _type == 'blog.post' && defined(categories[0]->slug.current) => ['category:' + categories[0]->slug.current],
    _type == 'person' && defined(slug.current) => ['sanity:slug:' + slug.current],
    _type == 'site' => ['site-config'],
    _type == 'legal' => ['legal']
  )
}
```

L'header `Content-Type` deve essere `application/json`.

### Modalità alternativa: `document` (auto-derive)

Se preferisci rimandare la composizione dei tag al server, puoi omettere
`tags` dal GROQ projection e inviare invece `document: { _type, _id, slug }`
nel body. Il route handler calcolerà i tag equivalenti via `tagsForDocument()`:

```groq
{
  'path': select( /* come sopra */ ),
  'document': {
    '_type': _type,
    '_id': _id,
    'slug': coalesce(metadata.slug.current, slug.current)
  }
}
```

Payload risultante lato server:

```
[
  "sanity",
  "sanity:type:blog.post",
  "sanity:doc:<id>",
  "sanity:slug:mio-post"
]
```

`tags: [...]` e `document: {...}` possono essere combinati nello stesso
body per casi misti (es. tag custom di categoria).

### Flusso end-to-end

Cosa succede quando un autore pubblica un singolo post:

1. Sanity valuta la GROQ projection: emette `path: '/calcio/mio-post'` e,
   secondo la modalità scelta, `tags: [...]` oppure `document: {...}`.
2. Sanity invia `POST /api/revalidate` con header `x-revalidate-secret: <secret>`
   e body.
3. `isAuthorized()` confronta `safeEqual(secret, REVALIDATE_SECRET)` → OK.
4. `processRevalidation()` (in `src/lib/revalidate-handler.ts`) deriva i
   tag finali e chiama `revalidateTag(t, { expire: 0 })` per ognuno.
5. Chiama `revalidatePath('/', 'layout')` e `revalidatePath(path)`.
6. Restituisce `{ ok: true, flushedTags: [...], paths: [...] }`.
7. Il prossimo render di `/calcio/mio-post` ricostruisce solo quella pagina.
   Tutte le altre restano cached.

---

## Config: env vars richieste

| Variable | Note |
|---|---|
| `REVALIDATE_SECRET` | **32+ byte hex** (es. `openssl rand -hex 32`). Richiesto dal route handler. |
| `SANITY_API_READ_TOKEN` | Viewer token per fetchSanityLive. |
| `SANITY_API_WRITE_TOKEN` | Editor token per publish-scheduled cron (separato). |

Senza `REVALIDATE_SECRET`, `/api/revalidate` rifiuta ogni richiesta.

---

## Bypass cache

La cache è bypassata nelle seguenti condizioni:

1. **Dev mode** (NODE_ENV !== 'production'): niente cache, hit diretto a Sanity.
2. **Draft / preview** (`draftMode().isEnabled`): niente cache, draft visibili.

Niente auto-bypass su GROQ: ogni callsite dichiara `cacheHint` (o non lo fa)
ed è quindi responsabile della politica di cache. Le query senza
`cacheHint` finiscono solo con il tag globale `'sanity'` (e vengono quindi
invalidate da QUALSIASI publish, non chirurgicamente).

---

## Debug delle cache in produzione

### Hit/Miss delle pagine

L'header HTTP `x-vercel-cache` ritorna uno di:

- `HIT` — la pagina è stata servita dal Vercel CDN Edge.
- `MISS` — la pagina è stata rigenerata e incacheata.
- `PRERENDER` — la pagina è stata generata a build time e non ha rivalidato.

Per vedere se la **data cache** di una query ha colpito, confrontare i log
del server Vercel: ogni chiamata a `cachedFetch` logga il numero di tag
invalidati nelle risposte di `/api/revalidate`.

### Flag ambiente

```
NEXT_PRIVATE_DEBUG_CACHE=1   # log dettagliato di Unstable_cache hits/misses
NEXT_PRIVATE_DEBUG_OUTPUT=1  # include i dati nel log
```

Da usare solo in dev / preview, MAI in produzione (rallenta e logga).

### Smoke test cache + invalidation

Da CLI locale (mentre Vercel gira in preview):

```sh
# 1. Hit iniziale (MISS), la query entra in cache
curl -sI https://trmsport.com/calcio/ultimo-post | head

# 2. Trigger invalidation (pubblica un post in Sanity → webhook → /api/revalidate)
curl -X POST https://trmsport.com/api/revalidate \
  -H "x-revalidate-secret: <REVALIDATE_SECRET>" \
  -H "Content-Type: application/json" \
  -d '{"tags":["sanity","sanity:type:blog.post","sanity:slug:ultimo-post"],"path":"/calcio/ultimo-post"}'

# Risposta attesa: { "ok": true, "flushedTags": [...], "paths": ["/", "/calcio/ultimo-post"], "now": ... }

# 3. Hit successivo (MISS post-invalidation, poi HIT)
curl -sI https://trmsport.com/calcio/ultimo-post | head
```

---

## Edge cases noti

1. **Vercel cold start**: la Data Cache è **condivisa** tra le istanze Vercel,
   non locale alla function. Cold start non perde la cache.
2. **Build time (`next build`)**: le pagine prerenderizzate hanno cache in
   loro stesso. Il revalidation le ricostruisce dopo il deploy via
   revalidatePath.
3. **Concurrency / dogpile**: `unstable_cache` deduplica le richieste
   concorrenti per la stessa key — una sola esegue la query Sanity, le altre
   ricevono lo stesso risultato. Niente stampede.
4. **Cache locale su viewer**: il CDN di Vercel a livello edge (HTTP cache)
   è separato dalla Next.js Data Cache. La data cache controlla solo le
   Server Components / fetch. La cache HTTP edge è controllata da
   `Cache-Control` headers (vedi `app/api/og/route.tsx`).
5. **`fetchSanity` direct**: NON passa per `unstable_cache`. È usato in
   contesti build-time (es. redirect in `next.config.ts`) dove la cache
   non serve.

---

## Metriche & prossimi passi

Per monitorare l'efficacia del cache, integrare:

- Vercel Analytics → campo `x-vercel-cache` per % HIT/MISS
- Custom server log per:
  - Quante volte una query specifica MISS / HIT
  - Quante volte `/api/revalidate` viene chiamato in un intervallo
  - Quanto tempo impiega una cache MISS (latenza Sanity)
- Allert su:
  - Hit ratio < 70% dopo 24h (cache troppo aggressiva o query sbagliate)
  - 5xx su `/api/revalidate` (webhook auth rotto)
