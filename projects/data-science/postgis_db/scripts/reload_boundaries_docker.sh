#!/bin/bash
# Host-side: reload all boundary / place tables into a running compose service.
# Paths are resolved from this script's location (portable across machines).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "${ROOT}"

SERVICE="${COMPOSE_SERVICE:-postgis}"

if ! command -v docker >/dev/null 2>&1; then
  echo "ERROR: docker not found on PATH" >&2
  exit 1
fi

echo "Reloading boundaries via docker compose service '${SERVICE}'..."
docker compose exec -T "${SERVICE}" \
  env BOUNDARY_GEOJSON_DIR=/data \
  bash /usr/local/lib/lucky-parking/load_boundaries.sh
