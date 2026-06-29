# Setup & Runbook — Fantasy Index Pipeline

> **Companion to:** `docs/ARCHITECTURE-fantacalcio.md` · **ADR:** `docs/ADR-0001-fbref-vs-alternatives.md`

This is the operational runbook: how to provision secrets, run the pipeline locally for a smoke test, and configure the GitHub Actions cron for production.

## 1. Environment Variables

The pipeline needs 3 server-only env vars (in addition to the existing `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` that already power the newsletter + view-tracking features).

| Var | Required? | Default | Generator |
|---|---|---|---|
| `FANTASY_INGEST_SECRET` | yes (ingest) | — | `openssl rand -hex 32` |
| `UPSTASH_REDIS_REST_URL` | yes | — | Upstash console |
| `UPSTASH_REDIS_REST_TOKEN` | yes | — | Upstash console |
| `FANTASY_REDIS_PREFIX` | optional | `fantasy` (hard-coded fallback in `store.ts`) | — |
| `FANTASY_RANKINGS_TTL_SECONDS` | optional | `3600` | — |

Public env vars (`NEXT_PUBLIC_*`) are unchanged. `FANTASY_*` is server-only — never prefix with `NEXT_PUBLIC_`.

## 2. Local Smoke Test (one shot)

```bash
# 1. Make sure .env.local has FANTASY_INGEST_SECRET (≥32 hex chars)
grep FANTASY_INGEST_SECRET .env.local

# 2. Run the script — it kills any conflicting `next dev` on :3000,
#    starts the server, exercises 3 endpoints, then tears down.
bash scripts/fantasy_local_smoke.sh
```

Expected output:

| # | Call | Status | Body |
|---|---|---|---|
| 1 | `POST /api/fantasy/ingest` no auth | `401` | `{"error":"Unauthorized"}` |
| 2 | `POST /api/fantasy/ingest` Bearer | `200` | `{"ok":true,"processed":3,"indexed":1,"errors":0}` |
| 3 | `GET /api/fantasy/rankings?competition=SA&limit=10` | `200` | `{ items: [...] }` |

The fixture at `scripts/fantasy_fixture.json` contains 3 synthetic Serie A matches (1 striker, 1 keeper, 1 midfielder). After the run, the Upstash ZSET `fantasy:rankings:SA:2025-2026` will hold those 3 players ordered by FantasyIndex descending. Re-running accumulates then resets it (`writeRanking` does `DEL` then `ZADD`).

## 3. Manually Exercising the API

After `pnpm dev` is running:

```bash
# Read top 10 rankings for Serie A in the current season
curl -s "http://localhost:3000/api/fantasy/rankings?competition=SA&limit=10" | jq

# Trigger ingest from the local fixture
SECRET=$(grep '^FANTASY_INGEST_SECRET=' .env.local | cut -d= -f2- | tr -d '"')
curl -s -X POST http://localhost:3000/api/fantasy/ingest \
  -H "Authorization: Bearer $SECRET" \
  -H 'Content-Type: application/json' \
  --data-binary @scripts/fantasy_fixture.json | jq
```

Query params accepted by `/api/fantasy/rankings`:
- `competition` (default `SA`)
- `season` (default `YYYY-YYYY` for current season)
- `limit` (default 100, max 500)

## 4. Production Deploy (Vercel)

The two API routes (`api/fantasy/ingest`, `api/fantasy/rankings`) are statically discovered by Next.js — no `vercel.json` config is needed beyond what already exists.

Add to **Vercel Project → Settings → Environment Variables**:

```
FANTASY_INGEST_SECRET      = <openssl rand -hex 32>
FANTASY_REDIS_PREFIX       = fantasy  (optional)
FANTASY_RANKINGS_TTL_SECONDS = 3600   (optional)
UPSTASH_REDIS_REST_URL     = <already set>
UPSTASH_REDIS_REST_TOKEN   = <already set>
```

Make sure both production and preview branches have `FANTASY_INGEST_SECRET`, otherwise the GitHub Actions cron will fail with 401 on preview deploys.

## 5. GitHub Actions Cron (production ingest)

The workflow at `.github/workflows/fantasy-scrape.yml` runs daily at 06:00 UTC.

Add to **Repository → Settings → Secrets and variables → Actions**:

| Secret | Where it goes |
|---|---|
| `FANTASY_WEBHOOK_URL` | `https://trmsport.com` (or preview URL while iterating) |
| `FANTASY_INGEST_SECRET` | Same value as in `.env.local` / Vercel |

Trigger manually from the Actions tab ("Run workflow") without waiting for the schedule while iterating on the scraper.

## 6. Common Failure Modes

| Symptom | Likely cause | Fix |
|---|---|---|
| `401 Unauthorized` on every POST | Secret mismatch | Verify the same `FANTASY_INGEST_SECRET` in Vercel, `.env.local`, and GH secrets |
| `{"error":"Rankings unavailable"}` | `UPSTASH_REDIS_REST_*` missing or wrong env | Check running `env \| grep UPSTASH` and the Upstash console |
| `processed:N indexed:0 errors:N` | ZADD silently failing mid-pipeline | `tail -50 .next/dev/logs/next-development.log`; usually a malformed key from the scrape script |
| Scrape workflow times out | FBref Cloudflare block | Workflow already retries with jitter; if persistent, slow down cron or reduce `LEAGUES` list |
| `requests.exceptions.ConnectionError` in scraper log | Wrong `FANTASY_WEBHOOK_URL` or wrong secret in GitHub Actions | URL should point at the Vercel app **without** a trailing slash; secret must match `FANTASY_INGEST_SECRET` in Vercel env |

## 7. Rotation

To rotate the ingest secret:

1. Generate a new secret: `openssl rand -hex 32`.
2. Set it as a **secondary** secret on Vercel alongside the old one. (Once dual-secret support lands in `http-auth.ts`, this is a one-step deployment.)
3. Update GH Actions secret.
4. Update `.env.local`.
5. Remove the old secret after 24h grace.

Today we ship single-secret. Rotation is redeploy-the-Vercel-app + update GHA secret + update `.env.local` in one atomic change.
