# Architecture — Fantasy Index Pipeline

> **Status:** proposed · **Owner:** TBD · **Last review:** 2026-06-29

This document describes how to add a player-level **Fantasy Index** engine to the existing `mariotramoblog` Next.js project. It is intentionally narrow: read-side API + daily ingest pipeline. UI is out of scope.

## 1. Goals & Non-Goals

**Goals**
- Daily refreshed rolling-window rankings for the top 5 European leagues (Serie A first).
- Reproducible "Fantasy Index" computed from objective stats (xG, xA, progressive passes, key passes, tackles, recoveries, clean sheets, minutes).
- Survive upstream source breakage without manual rerun for ≥ 7 days.
- Reuse existing project patterns for cron, error taxonomy, Redis access, HTTP auth, testing.

**Non-Goals (today)**
- Public-facing UI.
- Realtime updates (we ship daily, not per-minute).
- Vote replication. We do **not** mirror Fantacalcio.it vote distributions.
- Player transfer/lineup news. We only touch structured stats.

## 2. Component Diagram

```text
┌──────────────────────────┐    POST /api/fantasy/ingest     ┌────────────────────────┐
│  GitHub Actions (cron)   │ ──────────────────────────────► │  Next.js ingest route  │
│  Python · soccerdata     │   Bearer: FANTASY_INGEST_SECRET │  src/app/api/fantasy/  │
│  HTML cache via GHA Cache│                                 │  ingest/route.ts       │
└──────────────────────────┘                                 │   ├─ isAuthorized()    │
        │                                                    │   ├─ fantasyEngine.   │
        │ on HTML change                                     │   │  ingestMatchStats()│
        ▼                                                    │   └─ fantasyStore     │
┌──────────────────────────┐                                 │        .writeBatch()   │
│  FBref (Cloudflare)      │                                 └────────────┬───────────┘
└──────────────────────────┘                                              │
                                                                           ▼
                                                                  ┌─────────────────┐
                                                                  │  Upstash Redis  │
                                                                  │  fantasy:* keys │
                                                                  └────────┬────────┘
                                                                           │
                                                            ┌──────────────┼──────────────┐
                                                            ▼                             ▼
                                              ┌─────────────────────────┐    ┌──────────────────────┐
                                              │ Read API (frontend)     │    │ Read API (cron-self │
                                              │ /api/fantasy/rankings   │    │ -test)              │
                                              └─────────────────────────┘    └──────────────────────┘
```

## 3. File & Module Layout

Mirrors existing project structure (see `src/lib/cron-publish.ts` and `src/lib/football-data.ts`).

| Path | Purpose | Mirrors |
|---|---|---|
| `src/lib/fantasy/error.ts` | `FantasyError` + `FantasyErrorCode` enum | `football-data.ts` `StandingsError` |
| `src/lib/fantasy/store.ts` | Redis key builders + typed read/write (HASH, ZSET, STRING). Accepts a Redis-like dep. Null-safe like `redis.ts`. | `redis.ts` · `newsletter-store.ts` |
| `src/lib/fantasy/engine.ts` | `ingestMatchStats(deps)` returning `{ processed, errors }`. Never throws per row. | `cron-publish.ts` |
| `src/lib/fantasy/api.ts` | Read-side wrapper with in-memory TTL cache + stale-on-error. | `football-data.ts` |
| `src/lib/fantasy/ranking.ts` | Pure functions: `computeFantasyIndex(row, window)` for unit testing. | (new) |
| `src/lib/fantasy/schemas.ts` | Zod schemas for ingest payloads + read responses. | (new) |
| `src/app/api/fantasy/ingest/route.ts` | Thin auth + body validation + call to engine. | `newsletter/subscribe/route.ts` |
| `src/app/api/fantasy/rankings/route.ts` | Read API for client use. | (new) |
| `.github/workflows/fantasy-scrape.yml` | Python cron job; runs `scripts/fantasy_scrape.py`. | (new) |
| `scripts/fantasy_scrape.py` | soccerdata wrapper + serializer + POST. | (new) |
| `tests/fantasy/*.test.ts` | Unit tests for `ranking.ts`, `engine.ts`. | `src/lib/*.test.ts` |

## 4. Data Model — Redis Key Schema

Using Upstash Redis (REST, already wired, see `src/lib/redis.ts`). No relational DB.

| Key | Type | Value | TTL |
|---|---|---|---|
| `fantasy:player:{season}:{playerId}` | STRING (JSON) | Immutable player info (name, team, position, dob) + season aggregates. | Season end + 90d |
| `fantasy:matches:{season}:{season}#MD{matchday}:{playerId}` | HASH | One field per stat key (numeric). Frozen on ingest. | Season end + 90d |
| `fantasy:rankings:{competition}:{season}:{md}` | ZSET | Score = `fantasyIndex`, member = `playerId`. | Next MD - now or 7d, whichever shorter |
| `fantasy:rankings:{competition}:{season}` | ZSET | Current best published ranking. | 24h sliding |
| `fantasy:meta:{season}` | HASH | `lastIngestAt`, `lastSource`, `driftFlags` | 90d |
| `fantasy:rate:ingest:{ip}` | STRING | Rate-limit counter (also mirrored in-process). | 60s |

`season` = `YYYY-YYYY` (e.g. `2025-2026`). `matchday` is 1-indexed per competition. `competition` ∈ `{SA, PL, PD, BL1, FL1}` reusing the existing `COMPETITIONS` enum from `football-data.ts`.

**Why ZSET for rankings:** `ZRANGE … WITHSCORES` returns the top-N in O(log N + M). We never need a scan.

## 5. Ingest End-to-End

```text
GHA cron (06:00 UTC daily)
  scripts/fantasy_scrape.py
    1. sd.FBref(leagues=[...], seasons=[current])
    2. for comp in leagues:
         schedules, lineups, player_stats = fbref.read_…
         df = fbref.player_match_stats(…)
       for each row:
         payload.append({
           season, competition, matchday, matchId,
           playerId, minutes, xG, xA, progPasses, keyPasses,
           tacklesWon, recoveries, cleanSheet   # .get(col, 0)
         })
    3. POST https://<host>/api/fantasy/ingest
         headers: { Authorization: Bearer ${FANTASY_INGEST_SECRET} }
         chunks of 5_000 rows max (Upstash payload cap)

Next.js /api/fantasy/ingest
  1. isAuthorized(req, env.FANTASY_INGEST_SECRET)   # constant-time
  2. rate-limit by IP (5 req/min)                   # same Map pattern as newsletter
  3. body = await req.json(); FantasyIngestSchema.parse(body)
  4. const result = await ingestMatchStats({ store, ranking, env })
  5. return { ok: true, ...result, ingestedAt: now }
```

Per-row isolation in `ingestMatchStats` follows `cron-publish.ts` exactly: each match wrapped in `try/catch`, errors counted, never thrown.

## 6. Failure Modes & Mitigations

| Failure | Detection | Mitigation | Mirrors |
|---|---|---|---|
| FBref 403/429 (Cloudflare block) | `fetch` raises or returns 429 | Random 5–15s jitter, GHA retry-on-429 (max 3), circuit-break ingest API for 1h | — |
| `soccerdata` schema drift (column rename) | `df[col]` raises `KeyError` | Anti-corruption layer: use `.get(col, 0)`; emit `driftFlags` into `fantasy:meta:{season}`; alert if present | `cron-publish.ts` per-row try/catch |
| Upstash quota exceeded on write | `writeBatch` throws | Pipeline writes (1 round-trip per MD); fall back to in-memory `fantasy:rankings:*` ZSET until next ingest | `football-data.ts` stale-on-429 |
| Pipeline transport error from GHA | non-2xx response | GHA retries with exponential backoff; idempotency via `fantasy:meta:{season}:md:{n}` overwritten, not appended | — |
| Ingestion of a partial matchday | uno dei DF vuoti | `processed` count below 95% of expected → set `incomplete=true` in meta; read API surfaces, doesn't reject | — |
| Stale Redis data on read | `now - lastIngestAt > 36h` | Read API serves with `X-Stale: true` header and stale data + 1-week grace | `football-data.ts` in-memory TTL |
| Auth secret rotation | New secret missing on GHA | Read from GH Secrets + repo vars; dual-secret fallback in `isAuthorized` for 24h | `http-auth.ts` |

## 7. Observability

- **Logs**: structured `[fantasy] …` prefix. GHA logs uploaded as artifact; Next.js logs to Vercel.
- **Counters** logged at end of each ingest: `processed`, `errors`, `driftFlags`, `durationMs`, `bytesIn`.
- **Health read**: `GET /api/fantasy/rankings?league=SA&meta=1` returns `{ items, lastIngestAt, incomplete, driftFlags }`. Cheap enough to hit from a monitor.
- **Alerting**: a simple `scripts/fantasy_healthcheck.mjs` GHA workflow, weekly, asserts `lastIngestAt < 48h`.

## 8. Env Vars

Add to `.env.example` (mirroring `CRON_SECRET` convention already in use):

```
FANTASY_INGEST_SECRET=                # crypto.randomUUID(), rotated quarterly
FANTASY_RANKINGS_TTL_SECONDS=3600     # read-side in-memory TTL
FANTASY_REDIS_PREFIX=fantasy          # namespace; defaults to 'fantasy'
```

`UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` are already required.

## 9. Phased Rollout

1. **Phase 0 — Skeleton (no scraping)**:
   - Land files in §3 with stubs.
   - `ranking.ts` + tests with synthetic fixtures.
   - `tests: pnpm test` must include them in the existing `tsx --test` invocation in `package.json`.

2. **Phase 1 — Single source, single league**:
   - Add FBref scraper for Serie A only.
   - GHA cron daily.
   - Ingest route live.
   - Read API behind feature flag.

3. **Phase 2 — Quality**:
   - Drift detection (compare today's column set against yesterday's; alert on diff).
   - Backfill last season's worth of data via manual trigger job.

4. **Phase 3 — Multi-league**:
   - Enable PL, PD, BL1, FL1.
   - Per-league cron windows to avoid stampeding FBref.

5. **Phase 4 — UI** (out of scope for this doc, will be its own ADR).

## 10. What I'm Not Doing Yet (open questions)

- Postgres for joins: deferred until we exceed ~50k player-match rows. At Serie A × 38 MD × ~700 players × 60 stats, we're at ~1.6M numeric values — Redis ZSET + STRING is fine, but per-match queries become `MGET` storms. Trigger to revisit at year 2.
- `soccerdata` over `csv` exporter from FBref directly: delegate to scraping script ADR.
- Live data feeds (events, lineups): no provider in Phase 1.
