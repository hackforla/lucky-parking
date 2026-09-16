#!/bin/bash
# Host-side preflight: ensure raw_data/ and a Parking_Citations_*.csv exist
# before first-boot docker compose (which mounts ./raw_data → /raw_data).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
RAW_DIR="${ROOT}/raw_data"

if [[ ! -d "${RAW_DIR}" ]]; then
  echo "ERROR: missing directory: ${RAW_DIR}" >&2
  echo "Create it and add a city dump, e.g. Parking_Citations_YYYYMMDD.csv" >&2
  exit 1
fi

shopt -s nullglob
csv_candidates=("${RAW_DIR}"/Parking_Citations_*.csv)
if ((${#csv_candidates[@]} == 0)); then
  echo "ERROR: no Parking_Citations_*.csv in ${RAW_DIR}" >&2
  exit 1
fi

CSV="$(printf '%s\n' "${csv_candidates[@]}" | sort | tail -n 1)"
if [[ ! -s "${CSV}" ]]; then
  echo "ERROR: citations CSV missing or empty: ${CSV}" >&2
  exit 1
fi

echo "OK: ${CSV} ($(du -h "${CSV}" | awk '{print $1}'))"
