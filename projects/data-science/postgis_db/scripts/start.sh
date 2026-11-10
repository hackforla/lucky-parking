#!/usr/bin/env bash
# Preflight + docker compose up (macOS / Linux).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "${ROOT}"
bash scripts/preflight.sh
docker compose up -d --build
echo ""
echo "PostGIS first boot loads boundaries then citations (often 1-3+ hours)."
echo "API and explorer start after the load finishes."
echo ""
echo "  docker compose logs -f postgis"
echo "  bash scripts/db-status.sh"
echo ""
echo "Explorer: http://localhost:8080"
echo "API docs: http://localhost:8000/docs"
