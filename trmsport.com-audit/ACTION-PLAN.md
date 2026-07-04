

# Action Plan — trmsport.com

## Phase 1: Critical fixes (Week 1)

1. **Populate news-sitemap.xml** — emit articles from the last 48h with `<news:news>` metadata (publication name "TRM Sport", language `it`, publication_date, title). It currently serves an empty `<urlset>`.
2. **Return HTTP 404 from not-found pages** — non-existent URLs (incl. `/CALCIO`, any bad slug) currently return 200. In the App Router dynamic routes, call `notFound()` when the Sanity fetch returns null and verify the response status is 404.
3. **Fix sitemap.xml generator** — remove `/blog` (308 redirect); add the 13 published articles currently missing (list in FULL-AUDIT-REPORT.md §1). Check the Sanity GROQ filter used by the sitemap route.
4. **Add `<h1>` to homepage and static pages** (`/`, `/chi-siamo`, `/contatti`, `/correzioni`, `/linea-editoriale`, `/redazione`).

## Phase 2: High-impact improvements (Weeks 2–3)

5. **Kill duplicate article paths** — 301 the 9 non-canonical category variants (e.g. `/piloti/Ferrari-Leclerc-Hamilton-…` → `/ferrari/…`) and make internal links always use the canonical category.
6. **Normalize slug case** — middleware 301 from any case-variant to the canonical slug (lowercase variants currently 200 with no canonical). Generate lowercase slugs going forward.
7. **Shorten titles** — 141/162 exceed 60 chars. Template: `{headline ≤50ch} | TRM Sport`. Also fix the doubled `| Trm Sport | Trm Sport` suffix and give the 3 legal pages their own titles.
8. **Betting disclaimers** — standing 18+/gioco-responsabile block in the betting section layout.
9. **Remove `/chi-siamo-2`** — 301 to `/chi-siamo`, drop from sitemap.
10. **Permanent non-www redirect** — change `trmsport.com` → `www` from 307 to 308/301 (Vercel domain settings / `next.config.js` redirects with `permanent: true`).

## Phase 3: Content & authority (Month 2)

11. Expand thin articles (<400 words) or merge them; expand `/chi-siamo` and trust pages.
12. Unify brand naming to one casing ("TRM Sport") across titles, WebSite/Organization schema, llms.txt.
13. Decide and align the AI-crawler policy in robots.txt (currently blocks CCBot/ClaudeBot/Meta but allows GPTBot/Perplexity — and ships llms.txt); update llms.txt links to www host.
14. Enrich author-page Person schema (jobTitle, sameAs); internal-link the orphaned `/legal/termini-di-servizio`.

## Phase 4: Monitoring & iteration (Ongoing)

15. Enable ISR (`revalidate`) for homepage/category pages to get edge-cache hits; watch homepage flight-data size (currently 349KB inline).
16. Set up Google Search Console + CrUX monitoring; re-audit news sitemap inclusion in GSC after Phase 1.
17. Verify SearchAction `/?q=` actually renders search results; otherwise point schema at the real search route.
