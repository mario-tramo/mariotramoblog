# ADR-0001 — Choose FBref (via `soccerdata`) as primary source for player-level advanced stats

- **Status:** proposed
- **Date:** 2026-06-29
- **Decider:** TBD (project owner)
- **Driver:** need reliable, free, advanced per-player stats (xG, xA, progressive passes, tackles, recoveries) for the Fantasy Index feature.

## Context

We are adding a Fantasy Index engine to `mariotramoblog`. The project's existing data layer (`src/lib/football-data.ts`) only handles competition-level standings via football-data.org / API-Sports; it has no player-level data and no advanced-event stats.

Two distinct data needs now coexist:

1. Competition-level (standings, fixtures, results) — **already solved** via API-Sports.
2. Player-level (per-match advanced stats) — needs a new source.

Candidate sources reviewed:

| Source | Pros | Cons | Verdict |
|---|---|---|---|
| **FBref + `soccerdata`** | Free · 10+ yr history · xG/xA/progressive stats · mature Python wrapper · uniform API across sources | Aggressive Cloudflare/rate limit · scrapes break on schema changes · no precomputed votes | **Chosen** |
| SofaScore | Player ratings per match · rich UI · granular updates | Unofficial reverse-engineered API · no scrape library · strongest "vote replication" signal we don't actually want | Rejected: aligns with vote replication, not with reproducible objective index |
| FotMob | Clean mobile-first API · good coverage | Less used by analytics community; harder to enrich with xG-style metrics | Rejected: weaker advanced-stats coverage |
| Understat (xG only) | Best free xG source | Single stat family; insufficient for fantasy index | Rejected as primary; useful complementary |
| Opta / StatsBomb (paid) | Authoritative | SKU cost (5-figure €/yr minimum) | Out of scope today |
| API-Sports fixtures endpoint | Already integrated | No per-player advanced stats | Rejected for this use case |

The pasted brief recommended FBref + `soccerdata`. We accept that recommendation with the hardening notes below.

## Decision

**Primary source for player-level stats = FBref, accessed through the Python `soccerdata` library, scraped via an external Python cron job.**

The scrape runs as a **GitHub Actions scheduled workflow** (not a Vercel cron, because Vercel's 50s hobby / 300s pro cron window is too small for rate-limited FBref scraping and Vercel functions cannot execute Python with soccerdata's disk-cache needs natively).

Parsed data flows through a **Next.js ingest webhook** (`/api/fantasy/ingest`) that is auth-protected by a dedicated secret (`FANTASY_INGEST_SECRET`) using the same pattern as `src/lib/http-auth.ts` and the existing `CRON_SECRET` convention.

## Consequences

**Positive**
- Reproducible. FBref's underlying data is Opta-derived and consistent year-over-year; we can recompute historical Fantasy Index from the same source series.
- Library abstraction. `soccerdata` exposes FBref, SofaScore, ESPN, Understat, WhoScored through the same interface — we can swap or add sources later without rewriting the pipeline.
- Storage-light. Per-match rows are write-once; ZSET rankings are computed deterministically.
- Fits existing project conventions (cron, error class taxonomy, null-safe Redis, in-memory read cache, `tsx --test`).

**Negative**
- Scrape fragility. FBref has changed HTML structure (notably 2024) and uses Cloudflare. Mitigated by `.get(col, 0)` anti-corruption layer in scraper + drift detection + retries with jitter.
- GHA cron runtime cap (6h/job) is comfortable but not infinite. We commit to **daily** cadence, not matchday-cadence, accepting up to 24h freshness loss.
- Football-data.org stays as-is for standings. Two upstream vendors means two failure domains. Acceptable: each is loosely coupled.

**Neutral**
- Initial Python tooling is added to a JS-only repo via `scripts/` + GHA workflow. No Python runtime dependency inside Next.js.
- Tax/regulatory: scraping public data we don't redistribute at scale. Not an issue at our volume.

## Alternatives Considered

### Alt A — SofaScore as primary
Rejected. Aligns with vote replication, which is a non-goal.

### Alt B — Understat (xG only)
Rejected as primary. Could be added later as a sanity reference against FBref's xG numbers.

### Alt C — Paid Opta/StatsBomb
Rejected for v1. Reevaluate if (a) scrape breaks > 2× consecutively, (b) business expects published "official" stats, or (c) volume reaches > 100 GB bandwidth/mo and triggers ToS concerns.

### Alt D — Multi-source aggregation from day one
Rejected. Premature complexity. We design the pipeline so a second source can be added (separate keys per `source` field in payloads) but we ship with one source for v1.

## Implementation Notes

- **Auth**: webhook protected by `FANTASY_INGEST_SECRET` (32-byte random). Constant-time compare via `src/lib/http-auth.ts`. Dual-secret support (current + previous) for 24h rotation.
- **Idempotency**: ingest payloads are keyed by `{season}:{competition}:{MD}:{playerId}`. Last write wins. No upsert conflicts.
- **Observability**: see `docs/ARCHITECTURE-fantacalcio.md` §7.
- **Testing**: `ranking.ts` is the only critical pure logic; unit-tested with synthetic fixtures.
- **Feature flag**: read API behind `FANTASY_ENABLED` env var (default off in prod for v1).

## References

- Pasted brief: FBref / SofaScore / FotMob comparison + "Fantasy Index from raw events" recommendation.
- Project conventions: `src/lib/cron-publish.ts`, `src/lib/football-data.ts`, `src/lib/redis.ts`, `src/lib/http-auth.ts`, `src/lib/newsletter-store.ts`.
- External: [`probberechts/soccerdata`](https://github.com/probberechts/soccerdata), [FBref.com](https://fbref.com).
- Companion doc: `docs/ARCHITECTURE-fantacalcio.md`.
