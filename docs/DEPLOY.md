# Deploy Checklist · Pre-Produzione

Questa checklist copre le operazioni NON-codice necessarie per il GO-LIVE in
produzione su Vercel. I fix di codice sono già stati applicati (vedi
analisi pre-prod e PR associata).

---

## 1. Vercel project setup

- [ ] Importare la repo GitHub in Vercel (https://vercel.com/new).
- [ ] Framework preset: **Next.js**.
- [ ] Root directory: `./` (root).
- [ ] Build command: `pnpm build` (default).
- [ ] Output: lascia default (Next.js standalone).
- [ ] Region: **`fra1` (Frankfurt)** — EU-only per compliance GDPR.
- [ ] **Production Branch**: `main`.
- [ ] Auto-assign domains production/preview.

## 2. Environment variables (Vercel → Project → Settings → Environment Variables)

Imposta TUTTE le var di [.env.example](../.env.example) in **Production**.

Per ogni secret:
- Genera un valore random di almeno 32 byte hex:
  ```sh
  openssl rand -hex 32
  ```
- Non riciclare valori fra `REVALIDATE_SECRET` e `CRON_SECRET`.
- Non ruotare i secrets di Sanity subito dopo aver lanciato il seed
  (attendi che la prima pubblicazione sia andata a buon fine).

`NEXT_PUBLIC_BASE_URL` deve essere l'URL finale in HTTPS (es. `https://trmsport.com`).

### Sanity tokens

- `SANITY_API_READ_TOKEN`: ruolo **Viewer**.
- `SANITY_API_WRITE_TOKEN`: ruolo **Editor** (solo per il cron publish).

## 3. Upstash Redis (GDPR EU data residency)

- [ ] Crea un database Upstash (https://console.upstash.com).
- [ ] **Region obbligatoria**: `EU-Central-1` (Frankfurt).
- [ ] Primary: `EU-Central-1`. Read replica (opzionale): stessa region.
- [ ] Copia `REST URL` e `REST TOKEN` nelle env var `UPSTASH_REDIS_REST_URL`
      e `UPSTASH_REDIS_REST_TOKEN`.

## 4. Sanity dataset preparation

- [ ] Esegui `pnpm seed:legal` per pubblicare `privacy-policy`,
      `cookie-policy`, `termini-di-servizio` nel dataset `production`.
- [ ] Apri lo Studio (https://trmsport.com/admin) e verifica che le 3
      pagine legali siano pubblicate.
- [ ] Completa i **placeholder** eventuali rimasti nelle pagine legali
      controllando le `NEXT_PUBLIC_CONTACT_*`.
- [ ] Crea almeno 1 documento `site` (richiesto da SanityPress).
- [ ] Crea almeno 1 `page` di slug `index`.
- [ ] Verifica che il publish di un articolo triggeri il webhook verso
      `/api/revalidate` (header `x-revalidate-secret` con `REVALIDATE_SECRET`).

## 5. Cron schedule (Vercel Cron)

Aggiungi a `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/publish-scheduled",
      "schedule": "*/5 * * * *"
    },
    {
      "path": "/api/newsletter/sweep",
      "schedule": "0 3 * * *"
    }
  ]
}
```

- **publish-scheduled**: pubblica i documenti Sanity con `publishAt <= now()`
  ogni 5 minuti (header `Authorization: Bearer <CRON_SECRET>`).
- **newsletter/sweep**: rimuove pending (>7d) e confirmed stale (>5y) per
  conformità GDPR art. 5(1)(e) — retention automatica (stesso auth).

## 6. Domini, DNS, HTTPS

- [ ] Dominio custom aggiunto in Vercel (`trmsport.com` + `www.trmsport.com`).
- [ ] DNS configurato (CNAME `cname.vercel-dns.com` per `www`, ALIAS/APEX
      per il root).
- [ ] HTTPS attivo (Vercel emette certificati Let's Encrypt automaticamente).
- [ ] **`Strict-Transport-Security` è preload-ready**: la header è già
      impostata in [`next.config.ts`](../next.config.ts) con
      `max-age=63072000; includeSubDomains; preload`. **Solo dopo** aver
      confermato HTTPS robusto su TUTTI i sottodomini, invia la
      submit-request a https://hstspreload.org.

## 7. Monitoring & error tracking

- [ ] Crea progetto su https://sentry.io (free tier) o equivalente
      (Logflare, Datadog).
- [ ] Aggiungi `SENTRY_DSN` (o equivalente) come env var.
- [ ] Opzionale: attiva **Vercel Analytics** e **Speed Insights** in Vercel.
  - Questi sono **bloccati** dal cookie banner finché l'utente non accetta.
  - Il banner è già GDPR-compliant (`src/ui/features/CookieConsent.tsx`).
- [ ] Abilita **Vercel Web Vitals (Real User Monitoring)**.
- [ ] Configura alert su:
  - 5xx rate > 1% in 5 min.
  - Newsletter API 5xx > 0.
  - CPU/function-execution budget > 80%.

## 8. Pre-launch smoke test

Esegui manualmente (o via health-check script):

1. Visita `/` → 200 OK, pagine legali linkate in footer.
2. Visita `/legal/privacy-policy`, `/legal/cookie-policy`,
   `/legal/termini-di-servizio` → 200 OK, data aggiornata.
3. Apri cookie banner → clicca **Accetta** → verifica primo-party cookie
   `trm_consent=accepted; SameSite=Lax; Secure`.
4. Ricarica la pagina → il banner NON deve ricomparire (consenso persistente).
5. Disattiva JS → ricarica → il banner resta in stato **pending**
   (accettabile: nessun analytics attivo senza JS).
6. Newsletter:
   - Submit email valido + consenso → 200 OK.
   - Clicca su `/api/newsletter/confirm?token=<token>` → "Iscrizione
     confermata" + cookie conferma.
   - Clicca su `/api/newsletter/unsubscribe?token=<unsub-token>` →
     "Iscrizione revocata", rimosso da Redis.
7. `/api/revalidate` protetto: con secret sbagliato → 401.
8. `/api/cron/publish-scheduled` protetto: senza bearer → 401.
9. `curl -I https://trmsport.com/` deve mostrare:
   - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
   - `Content-Security-Policy` con default-src 'self'.
   - `Referrer-Policy: strict-origin-when-cross-origin`.
   - `X-Frame-Options: SAMEORIGIN`.
   - `Permissions-Policy: camera=(), microphone=(), geolocation=()`.

## 9. Post-launch

- [ ] Submit sitemap a Google Search Console (https://search.google.com/search-console).
- [ ] Verifica che Bing Webmaster Tools (`https://www.bing.com/webmasters`) veda
  il sitemap via IndexNow hook (se previsto) o submit manuale.
- [ ] Verifica che il robots.txt blocchi correttamente i bot AI
  (`GPTBot`, `ClaudeBot`, `Google-Extended`, `Applebot-Extended`,
  `PerplexityBot`, ...) tramite un probe manuale tipo:
  ```sh
  curl -A "GPTBot/1.0" https://trmsport.com/robots.txt
  ```
- [ ] Configura backup periodici del dataset Sanity (export weekly).
- [ ] Attiva alerts uptime (UptimeRobot, BetterStack, ...).

---

## Rollback

Vercel conserva le ultime 10 build: rollback disponibile da
`Deployments → ⋯ → Promote to Production`.

Per il CMS, Sanity conserva uno storico delle modifiche — è sempre possibile
ripristinare un documento.

Per Redis (Upstash), fai uno snapshot periodico dal dashboard.
