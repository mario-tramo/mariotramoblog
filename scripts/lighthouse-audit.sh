#!/usr/bin/env bash
set -euo pipefail

# ──────────────────────────────────────────────
# Lighthouse batch audit — 10 pagine
# ──────────────────────────────────────────────

BASE="${1:-http://localhost:3000}"
OUTDIR="${2:-/tmp/lighthouse-reports}"
CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
mkdir -p "$OUTDIR"
rm -f "$OUTDIR"/*.json

PAGES=(
  "/"
  "/chi-siamo"
  "/calcio"
  "/tennis"
  "/motori"
  "/classifiche"
  "/showcase"
  "/autori/mario-tramo"
)

# aggiunge fino a 2 articoli dalla sitemap (se presenti)
if curl -sf --max-time 5 "$BASE/sitemap.xml" > /dev/null 2>&1; then
  while IFS= read -r url; do
    path="${url#$BASE}"
    [[ -n "$path" && "$path" != "null" ]] && PAGES+=("$path")
  done < <(curl -s --max-time 30 "$BASE/sitemap.xml" \
    | grep '<loc>' \
    | sed 's|<loc>||;s|</loc>||' \
    | grep -v '^null$' \
    | grep -vE '^https?://[^/]+/?$' \
    | grep -v '/autori/' \
    | head -2)
fi

# deduplica e taglia a 10
UNIQ=()
while IFS= read -r p; do
  UNIQ+=("$p")
done < <(printf "%s\n" "${PAGES[@]}" | sort -u | head -10)
PAGES=("${UNIQ[@]}")

echo "═══ Lighthouse Audit ═══"
echo "Target: $BASE"
echo "Pages:  ${#PAGES[@]}"
printf '  %s\n' "${PAGES[@]}"
echo ""

export CHROME_PATH

run_lighthouse() {
  local path="$1"
  local name="${path//\//_}"
  name="${name:-root}"
  local url="$BASE$path"
  local out="$OUTDIR/$name.json"

  echo "→ Lighthouse $path"
  npx lighthouse "$url" \
    --output=json \
    --output-path="$out" \
    --quiet \
    --chrome-flags="--headless=new --no-sandbox" \
    --only-categories=performance,accessibility,best-practices,seo \
    2>/dev/null
}

for path in "${PAGES[@]}"; do
  run_lighthouse "$path"
done

# ──────────────────────────────────────────────
# Report
# ──────────────────────────────────────────────
echo ""
echo "═══ RISULTATI ═══"
echo ""

declare -a NAMES SCORES

for f in "$OUTDIR"/*.json; do
  raw=$(basename "$f" .json)
  name="${raw//_//}"
  name="${name#/}"

  scores=$(python3 -c "
import json
with open('$f') as fh:
    d = json.load(fh)
cats = d.get('categories', {})
out = {}
for k, v in cats.items():
    out[v['title']] = round(v['score'] * 100)
print(json.dumps(out))
" 2>/dev/null) || scores="{}"

  NAMES+=("$name")
  SCORES+=("$scores")
done

printf "%-65s %6s %6s %10s %6s\n" "Pagina" "Perf." "Access." "BestPr." "SEO"
printf "%s\n" "─────────────────────────────────────────────────────────────────────────────────"

for i in "${!NAMES[@]}"; do
  name="${NAMES[$i]}"
  s="${SCORES[$i]}"

  perf=$(echo "$s" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('Performance','–'))" 2>/dev/null || echo "–")
  acc=$(echo "$s" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('Accessibility','–'))" 2>/dev/null || echo "–")
  bp=$(echo "$s" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('Best Practices','–'))" 2>/dev/null || echo "–")
  seo=$(echo "$s" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('SEO','–'))" 2>/dev/null || echo "–")

  printf "%-65s %6s %6s %10s %6s\n" "$name" "$perf" "$acc" "$bp" "$seo"
done

echo ""
echo "Report JSON: $OUTDIR"
echo ""

# medie
sum_perf=0; sum_acc=0; sum_bp=0; sum_seo=0; count=0
for s in "${SCORES[@]}"; do
  p=$(echo "$s" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('Performance',-1))" 2>/dev/null) || p=-1
  a=$(echo "$s" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('Accessibility',-1))" 2>/dev/null) || a=-1
  b=$(echo "$s" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('Best Practices',-1))" 2>/dev/null) || b=-1
  o=$(echo "$s" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('SEO',-1))" 2>/dev/null) || o=-1
  (( p >= 0 )) && { sum_perf=$((sum_perf+p)); count=$((count+1)); }
  (( a >= 0 )) && sum_acc=$((sum_acc+a))
  (( b >= 0 )) && sum_bp=$((sum_bp+b))
  (( o >= 0 )) && sum_seo=$((sum_seo+o))
done

echo "═══ MEDIA ═══"
printf "Performance:      %3d/100\n" $((sum_perf/count))
printf "Accessibility:    %3d/100\n" $((sum_acc/count))
printf "Best Practices:   %3d/100\n" $((sum_bp/count))
printf "SEO:              %3d/100\n" $((sum_seo/count))
