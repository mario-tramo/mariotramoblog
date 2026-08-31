#!/usr/bin/env bash
set -euo pipefail

OUTPUT="${1:-github-secrets-temporaneo.txt}"
DOMAIN="https://trmsport.com"

if ! command -v openssl >/dev/null 2>&1; then
  echo "Errore: openssl non è installato." >&2
  exit 1
fi

if [ -e "$OUTPUT" ]; then
  printf 'Il file %s esiste già. Sovrascrivere? [y/N] ' "$OUTPUT" >&2
  read -r answer
  case "$answer" in
    y|Y|yes|YES) ;;
    *) echo "Operazione annullata." >&2; exit 1 ;;
  esac
fi

umask 077

cat > "$OUTPUT" <<EOF
# Secret generati il $(date -u '+%Y-%m-%dT%H:%M:%SZ')
# Dominio: $DOMAIN
# NON committare, condividere o stampare questo file.

FANTASY_WEBHOOK_URL=$DOMAIN
FANTASY_INGEST_SECRET=$(openssl rand -hex 32)

STANDINGS_WEBHOOK_URL=$DOMAIN
STANDINGS_INGEST_SECRET=$(openssl rand -hex 32)

CRON_SECRET=$(openssl rand -hex 32)

# Inserisci qui il token Sanity di sola lettura.
SANITY_API_READ_TOKEN=
EOF

chmod 600 "$OUTPUT"
printf 'Creato %s con permessi 600.\n' "$OUTPUT"
printf 'Inserisci SANITY_API_READ_TOKEN prima di copiarlo nei GitHub Actions Secrets.\n'
printf 'Gli endpoint generati saranno:\n  %s/api/fantasy/ingest\n  %s/api/standings/ingest\n' "$DOMAIN" "$DOMAIN"
