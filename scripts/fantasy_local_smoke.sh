#!/usr/bin/env bash
# Local smoke test for the Fantasy pipeline.
#
# Behavior:
#   1. Kills any conflicting process on $PORT (commonly a stale `next dev`
#      from a previous session) so we always start clean.
#   2. Starts `pnpm dev`, waits for the server to respond.
#   3. POSTs `scripts/fantasy_fixture.json` once without auth (expect 401),
#      once with the bearer secret (expect 200).
#   4. GETs `/api/fantasy/rankings?competition=SA&limit=10`.
#   5. Tears down the dev server on exit.
#
# Usage: bash scripts/fantasy_local_smoke.sh
#
# Pre-requisites:
#   - .env.local contains FANTASY_INGEST_SECRET and UPSTASH_REDIS_REST_*
#   - pnpm is installed.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PORT="${PORT:-3000}"
LOG="/tmp/fantasy-dev.log"
PID=""

# Step 1 — free the port. We kill any process still listening on $PORT,
# which is the typical cause of "port 3000 is in use" and "Another next
# dev server is already running" errors after a crashed session.
CONFLICT_PID=""
if command -v lsof > /dev/null 2>&1; then
    CONFLICT_PID="$(lsof -ti :"$PORT" 2>/dev/null || true)"
elif command -v fuser > /dev/null 2>&1; then
    CONFLICT_PID="$(fuser "$PORT"/tcp 2>/dev/null | tr -d ' ' || true)"
fi
if [ -n "$CONFLICT_PID" ]; then
    echo "[smoke] killing existing process on port $PORT (pid=$CONFLICT_PID)"
    # shellcheck disable=SC2086
    kill $CONFLICT_PID 2>/dev/null || true
    sleep 2
    # Belt-and-braces: SIGKILL if still alive.
    if command -v lsof > /dev/null 2>&1; then
        STILL="$(lsof -ti :"$PORT" 2>/dev/null || true)"
        if [ -n "$STILL" ]; then
            echo "[smoke] port still busy, sending SIGKILL"
            # shellcheck disable=SC2086
            kill -9 $STILL 2>/dev/null || true
            sleep 1
        fi
    fi
fi

cleanup() {
    if [ -n "$PID" ] && kill -0 "$PID" 2>/dev/null; then
        echo "[smoke] killing dev server pid=$PID"
        kill "$PID" 2>/dev/null || true
        wait "$PID" 2>/dev/null || true
    fi
}
trap cleanup EXIT

echo "[smoke] starting pnpm dev (logs: $LOG)"
pnpm dev > "$LOG" 2>&1 &
PID=$!

echo "[smoke] waiting for http://localhost:$PORT ..."
READY=0
for i in $(seq 1 90); do
    if curl -fsS "http://localhost:$PORT/" > /dev/null 2>&1; then
        READY=1
        echo "[smoke] dev server up after ${i}s"
        break
    fi
    if ! kill -0 "$PID" 2>/dev/null; then
        echo "[smoke] dev server died; tail of log:"
        tail -50 "$LOG"
        exit 1
    fi
    sleep 1
done
if [ "$READY" -ne 1 ]; then
    echo "[smoke] dev server did not start within 90s"
    tail -50 "$LOG"
    exit 1
fi

SECRET="${FANTASY_INGEST_SECRET:-}"
if [ -z "$SECRET" ] && [ -f .env.local ]; then
    SECRET="$(grep -E '^FANTASY_INGEST_SECRET=' .env.local | head -1 | cut -d= -f2- | tr -d '"')"
fi
if [ -z "$SECRET" ]; then
    echo "[smoke] FANTASY_INGEST_SECRET not set (in env or .env.local)"
    exit 1
fi

BASE="http://localhost:$PORT"
FIXTURE="scripts/fantasy_fixture.json"

echo "[smoke] 1) unauthorized POST (expect 401)"
curl -s -o /tmp/fantasy-r1 -w "  -> status %{http_code}\n" \
    -X POST "$BASE/api/fantasy/ingest" \
    -H 'Content-Type: application/json' \
    --data-binary "@$FIXTURE"

echo "[smoke] 2) authorized POST"
curl -s -o /tmp/fantasy-r2 -w "  -> status %{http_code}\n" \
    -X POST "$BASE/api/fantasy/ingest" \
    -H "Authorization: Bearer $SECRET" \
    -H 'Content-Type: application/json' \
    --data-binary "@$FIXTURE"
echo "  body: $(cat /tmp/fantasy-r2)"

echo "[smoke] 3) GET rankings (SA, default season, top 10)"
curl -s -o /tmp/fantasy-r3 -w "  -> status %{http_code}\n" \
    "$BASE/api/fantasy/rankings?competition=SA&limit=10"
echo "  body: $(cat /tmp/fantasy-r3)"

echo "[smoke] done (full dev server log at $LOG)"
