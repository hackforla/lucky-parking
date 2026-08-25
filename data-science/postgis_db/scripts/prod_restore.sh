#!/usr/bin/env bash
# Restore a pg_dump into the production compose stack.
#
# Usage (from postgis_db/):
#   mkdir -p dumps && cp lucky_parking.dump dumps/
#   bash scripts/prod_restore.sh dumps/lucky_parking.dump
#
# Requires: docker compose -f docker-compose.prod.yml up -d (postgis healthy)
set -euo pipefail

COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"
DUMP="${1:-dumps/lucky_parking.dump}"

if [[ ! -f "$DUMP" ]]; then
  echo "Dump not found: $DUMP" >&2
  exit 1
fi

# shellcheck disable=SC1091
source .env 2>/dev/null || true
PGUSER="${POSTGRES_USER:-lucky}"
PGDB="${POSTGRES_DB:-lucky_parking}"

echo "Copying dump into postgis container..."
docker compose -f "$COMPOSE_FILE" cp "$DUMP" "postgis:/tmp/lucky_parking.dump"

echo "Restoring (this may take several minutes)..."
docker compose -f "$COMPOSE_FILE" exec -T postgis \
  pg_restore -U "$PGUSER" -d "$PGDB" --clean --if-exists --no-owner /tmp/lucky_parking.dump

echo "Verifying row counts..."
docker compose -f "$COMPOSE_FILE" exec -T postgis psql -U "$PGUSER" -d "$PGDB" -c \
  "SELECT
     (SELECT count(*) FROM citations) AS citations,
     (SELECT count(*) FROM zipcodes) AS zipcodes,
     (SELECT count(*) FROM places) AS places;"

echo "Done."
