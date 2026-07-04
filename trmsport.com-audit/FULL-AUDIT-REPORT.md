# SEO Audit — www.trmsport.com

**Date:** 2026-07-04 · **Pages crawled:** 163 (all sitemap URLs + homepage) · **Method:** full HTML crawl as Googlebot UA, header analysis, schema extraction, redirect/edge-case probing

## Executive Summary

**SEO Health Score: 67 / 100**
**Business type:** Italian sports news publisher (calcio, tennis, F1, betting) — Next.js App Router on Vercel, Sanity CMS.

The fundamentals are solid: every page has a title, meta description, self-referencing canonical, JSON-LD (NewsArticle/BreadcrumbList/WebSite), alt text on all 2,058 images, brotli compression, good TTFB (~0.2–0.4s), strong security headers, llms.txt, and working RSS feeds. The problems are concentrated in **news-specific indexing** (empty news sitemap), **crawl hygiene** (soft 404s, duplicate URL paths, sitemap gaps), and **on-page templates** (missing H1s, overlong titles, doubled brand suffix).

### Top 5 Critical/High Issues
1. **news-sitemap.xml is empty** — declared in robots.txt but contains zero URLs. A news site loses Google News / Top Stories discovery, its fastest indexing path.
2. **Soft 404s** — non-existent URLs return HTTP 200 (e.g. `/pagina-che-non-esiste-xyz`, `/CALCIO`). Google treats these as soft 404s; crawl budget waste and index pollution risk.
3. **Homepage (and 6 key pages) have no `<h1>`** — `/`, `/chi-siamo`, `/chi-siamo-2`, `/contatti`, `/correzioni`, `/linea-editoriale`, `/redazione`.
4. **Same articles live under multiple category paths** — 9 slugs resolve 200 under two categories (e.g. `/piloti/X` and `/ferrari/X`), and case-variant URLs (lowercase slug) return 200 **without any canonical tag**. Canonicals mitigate the two-category case, but internal links point at non-canonical variants.
5. **Betting content has zero responsible-gambling signals** — no 18+, no "gioco responsabile", no ADM/AAMS mention. YMYL quality issue and an Italian regulatory-context red flag.

### Top 5 Quick Wins
1. Populate `news-sitemap.xml` with articles from the last 48h (`<news:news>` tags).
2. Return real 404 status from the not-found page (Next.js `notFound()` already does this if wired correctly — currently it renders with 200).
3. Add an `<h1>` to the homepage and the 6 static pages.
4. Remove `/blog` (308 redirect) from sitemap.xml and add the 13 published articles that are missing from it.
5. Fix the title template that doubles the brand suffix (`… | Trm Sport | Trm Sport`) and unify brand casing (TRM SPORT vs TRM Sport vs Trm Sport).

---

## 1. Technical SEO (score 60)

### Critical
- **Empty news sitemap.** `https://www.trmsport.com/news-sitemap.xml` returns 200 with an empty `<urlset>`. robots.txt advertises it. For a daily news publisher this forfeits Google News/Top Stories inclusion. **Fix:** generate it from articles published in the last 48 hours with `<news:publication>`, `<news:publication_date>`, `<news:title>`.

### High
- **Soft 404s.** `GET /pagina-che-non-esiste-xyz` → HTTP 200 (title `404 — Pagina non trovata | Trm Sport | Trm Sport`, meta robots noindex). `GET /CALCIO` → 200. The noindex prevents indexing but Google still classifies these as soft 404s and keeps recrawling them. **Fix:** ensure the not-found route returns status 404 (in App Router, `notFound()` in the dynamic route's `generateMetadata`/page when the Sanity query returns null).
- **13 published articles missing from sitemap.xml** (linked internally, 200, self-canonical, but not listed): `/calcio/Mondiali-Messi-Argentina-Scaloni-sport-calcio`, `/calcio/analisi-tattica-pressing-napoli-conte`, `/calcio/var-polemiche-serie-a`, `/calciomercato/calciomercato-Juve-giovani-Ekhator-Pisilli-Lipani-Carnevali`, `/ciclismo/tour-de-france-Pogacar-Barcellona-percorso-tappe-ciclismo`, `/ferrari/f1-gp-imola-doppietta-ferrari`, `/formula-1/ferrari-sf-27-presentazione-maranello`, `/formula-1/hamilton-e-ferrari-si-puo-fare-la-storia-ci-sono-tutte-le-componenti`, `/motori/bagnaia-ducati-e-finita-un-divorzio-che-fa-bene-ad-entrambi`, `/motori/prima-volta-hamilton-in-ferrari-ora-lewis-puo-scrivere-la-storia`, `/tennis/Wimbledon-Sinner-Djokovic-Fonseca-sorprese-tabellone`, plus 2 cross-category duplicates. **Fix:** audit the sitemap generator's Sanity query (likely filtering by a field these docs lack, or excluding older/legacy category values).
- **Duplicate article paths across categories.** 9 slugs resolve 200 under two category prefixes (e.g. `/piloti/Ferrari-Leclerc-Hamilton-motori-classifica-Mercedes-dati` and `/ferrari/...` — canonical points to `/ferrari/...`). Internal links sometimes target the non-canonical variant, splitting crawl signals. **Fix:** 301 non-canonical category paths to the canonical one, and generate internal links from the canonical category only. Affected slug pairs: ferrari↔formula-1 (2), ferrari↔piloti, ferrari↔motori, calcio↔serie-a, motogp↔motori, formula-1↔motori (2), calcio↔tattiche.
- **Case-insensitive routing without canonical.** `/piloti/chi-e-hamilton-ferrari-mercedes-formula-uno` (lowercase variant of a mixed-case sitemap URL) returns 200 with **no canonical tag** — a fully indexable duplicate. **Fix:** enforce lowercase slugs with a middleware 301, or at minimum emit the canonical on all case variants. Long-term: stop generating mixed-case slugs (`chi-e-Hamilton-Ferrari-Mercedes-Formula-Uno`).

### Medium
- **`/blog` (308 → `/`) is listed in sitemap.xml.** Sitemaps must contain only 200, canonical URLs.
- **non-www → www redirect is 307 (temporary).** `https://trmsport.com/` → 307. Should be 308/301 so signals consolidate. (http → https is already 308.) On Vercel, set the redirect in the domain config or `next.config.js` `redirects()` with `permanent: true`.
- **Homepage never cache-hits.** `Cache-Control: private, no-cache, no-store` and `x-vercel-cache: MISS` on every request. Fine for freshness but every visitor and crawler pays full SSR. Consider ISR (`revalidate: 60`) for the homepage and category pages.
- **robots.txt blocks CCBot, ClaudeBot, Meta-ExternalAgent** — see AI Readiness.

### Working well
robots.txt valid with Host + sitemap declarations; HSTS with preload; CSP, nosniff, SAMEORIGIN, referrer-policy all present; https and trailing-slash normalization (308); RSS available at `/feed`, `/rss`, `/rss.xml`, `/feed.xml`; brotli compression (567KB HTML → 68KB wire); all 163 sitemap URLs resolve (except the `/blog` redirect); zero noindex leaks into the sitemap; canonicals present and self-referencing on all indexable pages.

## 2. On-Page SEO (score 60)

- **High — 7 pages missing `<h1>`, including the homepage** (`/`, `/chi-siamo`, `/chi-siamo-2`, `/contatti`, `/correzioni`, `/linea-editoriale`, `/redazione`). Articles are fine.
- **High — 141 of 162 titles exceed 60 characters** and get truncated in SERPs. Article titles concatenate headline + category + double brand. Example (80 chars): `/calcio/calciomercato-Inter-Marotta-Ausilio-Lautaro-Onana-Chivu`. **Fix:** shorten the template to `{headline} | TRM Sport` and cap headlines ~50 chars.
- **Medium — doubled brand suffix bug**: pages whose CMS title already contains the brand render `… | TRM Sport | Trm Sport` (seen on `/chi-siamo-2` and the 404 page). Fix the metadata template to dedupe.
- **Medium — 3 legal pages share one generic title** (`TRM Sport — Notizie sportive, risultati e approfondimenti | Trm Sport` on cookie-policy, privacy-policy, termini-di-servizio) — they have no page-specific titles at all.
- **Medium — keyword-list slugs.** Slugs like `calciomercato-Inter-Marotta-Ausilio-Lautaro-Onana-Chivu` are entity dumps, not readable phrases, and use mixed case. Prefer short lowercase descriptive slugs.
- **Low — 6 meta descriptions under 70 chars; 1 over 160.**
- **Low — brand casing inconsistent** across surfaces: `TRM Sport` (homepage title), `TRM SPORT` (WebSite schema name), `Trm Sport` (title suffix).
- Working well: unique meta descriptions everywhere, no duplicate article titles, single H1 on all articles, breadcrumbs, no hreflang needed (single-language site).

## 3. Content Quality & E-E-A-T (score 65)

- **High — betting section lacks responsible-gambling signals.** `/betting/betting-scommesse-wimbledon-sinner-djokovic-tennis-mondiali` contains no "18+", "gioco responsabile", ADM/AAMS reference or problem-gambling resource link. This is YMYL content in a regulated Italian market; it hurts trust with users and quality raters. **Fix:** add a standing disclaimer block to the betting layout.
- **Medium — duplicate About pages.** `/chi-siamo` (331 words) and `/chi-siamo-2` (205 words, 46% token overlap, orphaned — zero internal links, title shows the doubled-brand bug). Keep `/chi-siamo`; delete or 301 `/chi-siamo-2` and remove it from the sitemap.
- **Medium — thin articles.** Real articles under ~300 words exist (e.g. `/rugby/rugby-urc-zebre-parma-semifinale`, 251 words total page text). 23 pages total under 300 words (most are legal/static, acceptable there).
- **Medium — orphan pages:** `/chi-siamo-2` and `/legal/termini-di-servizio` receive zero internal links.
- Working well: named author bylines with linked author pages (`/autori/mario-tramo`), Person schema on 49 pages, published+modified dates in schema and meta, trust pages exist (corrections policy `/correzioni`, editorial line `/linea-editoriale`, `/redazione`, contacts) — rare and valuable for a small publisher, though several are thin (109–216 words) and missing H1s.

## 4. Schema / Structured Data (score 85)

Validated in depth on `/calcio/calciomercato-Roma-Gasperini-Greenwood-Kone-Mancini`:
- **NewsArticle: passes Google requirements.** headline 58 chars ✓, image array with crops ✓, datePublished/dateModified ISO+UTC ✓ (modified ≥ published ✓), author Person with url ✓, publisher NewsMediaOrganization with logo ✓, mainEntityOfPage ✓, articleSection ✓, description ✓.
- BreadcrumbList: correct positions and absolute @ids ✓. WebSite with SearchAction ✓.
- **Low — `isAccessibleForFree: null`** — emit `true` or omit the property.
- **Low — SearchAction target is `https://www.trmsport.com/?q={search_term_string}`** — the homepage returns 200 for `?q=` but verify it actually renders filtered results; otherwise point it at the real search route.
- **Low — WebSite `name: "TRM SPORT"` vs publisher `name: "TRM Sport"`** — unify for knowledge-graph consistency.
- Opportunity: author pages could carry richer Person schema (jobTitle, sameAs to social profiles); no VideoObject/LiveBlogPosting usage if/when relevant.

## 5. Performance (score 70)

Measured (curl, 3 runs): homepage TTFB 0.28–0.38s, article TTFB 0.20–0.23s, total download ~0.3–0.5s. Brotli enabled: homepage 567KB HTML → 68KB transferred. PSI API was quota-blocked; no CrUX field data pulled.

- **Medium — 349KB of inline RSC flight data (`self.__next_f`) on the homepage** (353KB inline scripts across 79 tags; 62% of the document). Cheap on the wire after brotli but expensive to parse on mid-range mobiles; it scales with the number of cards rendered. Reduce the homepage payload (fewer serialized fields per article card — the full card data appears duplicated in flight data).
- **Medium — zero edge-cache hits** (`x-vercel-cache: MISS` on all runs, `no-store`). ISR would cut TTFB and SSR cost.
- Working well: all 46 homepage images via next/image, 42 lazy-loaded, 1 correctly marked `fetchpriority=high`, WebP served via content negotiation (108KB JPEG → 90KB WebP), preconnect to cdn.sanity.io, **zero third-party scripts** (no ads/analytics in HTML).

## 6. Images (score 90)

- 2,058 `<img>` across the crawl, **0 missing alt text** — excellent.
- All routed through next/image with lazy loading; WebP negotiation works.
- og:image present on all 162 pages.
- Low: hero JPEG ~90–108KB at w=1200 is acceptable; AVIF would shave ~30%.

## 7. AI Search Readiness / GEO (score 70)

- **`llms.txt` exists** with a curated category map — ahead of most publishers. **Low:** it links the non-www host (`https://trmsport.com/...`), which 307-redirects; use the canonical www URLs.
- **Medium — inconsistent AI-crawler policy.** robots.txt blocks **CCBot, ClaudeBot, Meta-ExternalAgent** entirely, but allows GPTBot, OAI-SearchBot, PerplexityBot, Google-Extended, Bytespider. No CDN-level enforcement (all UAs get 200; robots-only). If the intent is content protection, the list is leaky; if the intent is AI-answer visibility, blocking Claude and Common Crawl (which feeds many engines) undercuts it — and publishing llms.txt while blocking ClaudeBot is contradictory. Decide a policy and make the list consistent.
- Citability: article text is fully server-rendered (no JS needed), clear datelines, h2/h3 subheadings, quotable facts. Good.
- Entity establishment: `/chi-siamo` exists but is thin (331 words) with no H1; brand casing inconsistency (TRM SPORT / TRM Sport / Trm Sport) weakens entity recognition.

---

## Scoring

| Category | Weight | Score | Weighted |
|---|---|---|---|
| Technical SEO | 22% | 60 | 13.2 |
| Content Quality | 23% | 65 | 15.0 |
| On-Page SEO | 20% | 60 | 12.0 |
| Schema | 10% | 85 | 8.5 |
| Performance | 10% | 70 | 7.0 |
| AI Readiness | 10% | 70 | 7.0 |
| Images | 5% | 90 | 4.5 |
| **Total** | | | **67** |

*Not covered (no credentials/tooling available): CrUX/GSC field data, backlink profile, live SERP positions, real-browser CWV (LCP/INP/CLS), Google News inclusion status.*
