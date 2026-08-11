#!/bin/bash
# Host-side preflight: ensure all boundary GeoJSON files exist under boundaries/.
# Paths are relative to this repo (no machine-specific absolute paths).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BOUNDARIES_DIR="${BOUNDARIES_DIR:-${ROOT}/boundaries}"

LAYERS=(
  neighborhood_councils
  zipcodes
  council_districts
  neighborhoods
  places
)

missing=0
for name in "${LAYERS[@]}"; do
  src="${BOUNDARIES_DIR}/${name}/${name}.geojson"
  if [[ ! -s "${src}" ]]; then
    echo "ERROR: missing or empty: ${src}" >&2
    missing=1
  else
    echo "OK: ${src} ($(du -h "${src}" | awk '{print $1}'))"
  fi
done

if ((missing)); then
  echo "ERROR: one or more boundary GeoJSON files are missing under ${BOUNDARIES_DIR}" >&2
  exit 1
fi

echo "All boundary GeoJSON sources present."
