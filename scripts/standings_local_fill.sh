#!/usr/bin/env bash
# Local fill script per le classifiche.
#
# Riempie Redis con dati di fixture via l'ingest endpoint locale.
# Avvia il dev server se non è già in esecuzione.
#
# Usage: bash scripts/standings_local_fill.sh
#
# Pre-requisiti:
#   - .env.local contiene STANDINGS_INGEST_SECRET e UPSTASH_REDIS_REST_*
#   - pnpm installato

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PORT="${PORT:-3000}"
LOG="/tmp/standings-fill.log"
PID=""

# Libera la porta se occupata
CONFLICT_PID=""
if command -v lsof > /dev/null 2>&1; then
    CONFLICT_PID="$(lsof -ti :"$PORT" 2>/dev/null || true)"
elif command -v fuser > /dev/null 2>&1; then
    CONFLICT_PID="$(fuser "$PORT"/tcp 2>/dev/null | tr -d ' ' || true)"
fi
if [ -n "$CONFLICT_PID" ]; then
    echo "[fill] killing existing process on port $PORT (pid=$CONFLICT_PID)"
    # shellcheck disable=SC2086
    kill $CONFLICT_PID 2>/dev/null || true
    sleep 2
    if command -v lsof > /dev/null 2>&1; then
        STILL="$(lsof -ti :"$PORT" 2>/dev/null || true)"
        if [ -n "$STILL" ]; then
            echo "[fill] port still busy, sending SIGKILL"
            # shellcheck disable=SC2086
            kill -9 $STILL 2>/dev/null || true
            sleep 1
        fi
    fi
fi

cleanup() {
    if [ -n "$PID" ] && kill -0 "$PID" 2>/dev/null; then
        echo "[fill] killing dev server pid=$PID"
        kill "$PID" 2>/dev/null || true
        wait "$PID" 2>/dev/null || true
    fi
}
trap cleanup EXIT

echo "[fill] starting pnpm dev (logs: $LOG)"
pnpm dev > "$LOG" 2>&1 &
PID=$!

echo "[fill] waiting for http://localhost:$PORT ..."
READY=0
for i in $(seq 1 90); do
    if curl -fsS "http://localhost:$PORT/" > /dev/null 2>&1; then
        READY=1
        echo "[fill] dev server up after ${i}s"
        break
    fi
    if ! kill -0 "$PID" 2>/dev/null; then
        echo "[fill] dev server died; tail of log:"
        tail -50 "$LOG"
        exit 1
    fi
    sleep 1
done
if [ "$READY" -ne 1 ]; then
    echo "[fill] dev server did not start within 90s"
    tail -50 "$LOG"
    exit 1
fi

SECRET="${STANDINGS_INGEST_SECRET:-}"
if [ -z "$SECRET" ] && [ -f .env.local ]; then
    SECRET="$(grep -E '^STANDINGS_INGEST_SECRET=' .env.local | head -1 | cut -d= -f2- | tr -d '"')"
fi
if [ -z "$SECRET" ]; then
    echo "[fill] STANDINGS_INGEST_SECRET non trovata né in env né in .env.local"
    echo "[fill] Imposta STANDINGS_INGEST_SECRET nel tuo .env.local"
    exit 1
fi

BASE="http://localhost:$PORT"
FIXTURE="scripts/standings_fixture.json"

echo "[fill] 1) POST unauthorized (expect 401)"
curl -s -o /tmp/standings-r1 -w "  -> status %{http_code}\n" \
    -X POST "$BASE/api/standings/ingest" \
    -H 'Content-Type: application/json' \
    --data-binary "@$FIXTURE"

echo "[fill] 2) POST authorized con fixture"
curl -s -o /tmp/standings-r2 -w "  -> status %{http_code}\n" \
    -X POST "$BASE/api/standings/ingest" \
    -H "Authorization: Bearer $SECRET" \
    -H 'Content-Type: application/json' \
    --data-binary "@$FIXTURE"
echo "  body: $(cat /tmp/standings-r2)"

echo "[fill] 3) GET classifiche via API"
for comp in SA PL PD BL1 FL1; do
    curl -s -o /tmp/standings-r3-"$comp" -w "  -> $comp status %{http_code}\n" \
        "$BASE/api/standings?competition=$comp"
done

echo "[fill] 4) GET pagina classifiche (serve-side)"
curl -s -o /dev/null -w "  -> /classifiche status %{http_code}\n" \
    "$BASE/classifiche"

echo "[fill] done. Visita http://localhost:$PORT/classifiche per vedere i dati."
