#!/bin/bash
set -euo pipefail

# Runs last on first container start (empty data volume), after boundary layers.
# Loads the newest Parking_Citations_*.csv from /raw_data into public.citations
# using the contract-oriented schema (issue_datetime, fine, violation, geom).
#
# Requires ./raw_data mounted at /raw_data with a Parking_Citations_*.csv file.
# For dump-only deploys (no CSV), set SKIP_CITATIONS_LOAD=1.

if [[ "${SKIP_CITATIONS_LOAD:-}" == "1" ]]; then
  echo "SKIP_CITATIONS_LOAD=1; skipping citations load."
  touch /var/lib/postgresql/data/.lucky_parking_init_done
  exit 0
fi

RAW_DIR=/raw_data

if [[ ! -e "${RAW_DIR}" ]]; then
  echo "ERROR: ${RAW_DIR} does not exist." >&2
  echo "Mount host postgis_db/raw_data at /raw_data (docker-compose does this)," >&2
  echo "or set SKIP_CITATIONS_LOAD=1 to skip citations on first boot." >&2
  exit 1
fi

if [[ ! -d "${RAW_DIR}" ]]; then
  echo "ERROR: ${RAW_DIR} exists but is not a directory." >&2
  exit 1
fi

shopt -s nullglob
csv_candidates=("${RAW_DIR}"/Parking_Citations_*.csv)
if ((${#csv_candidates[@]} == 0)); then
  echo "ERROR: no Parking_Citations_*.csv found in ${RAW_DIR}." >&2
  echo "Place a city parking citations dump there, e.g.:" >&2
  echo "  ${RAW_DIR}/Parking_Citations_YYYYMMDD.csv" >&2
  echo "Or set SKIP_CITATIONS_LOAD=1 to skip citations on first boot." >&2
  exit 1
fi

# Prefer the lexicographically last filename (usually the newest dated dump).
CSV="$(printf '%s\n' "${csv_candidates[@]}" | sort | tail -n 1)"

if [[ ! -f "${CSV}" ]]; then
  echo "ERROR: selected citations path is not a regular file: ${CSV}" >&2
  exit 1
fi

if [[ ! -s "${CSV}" ]]; then
  echo "ERROR: citations CSV is empty: ${CSV}" >&2
  exit 1
fi

echo "Using citations CSV: ${CSV} ($(du -h "${CSV}" | awk '{print $1}'))"
echo "Loading citations (this can take a long time)..."

# Socket auth is trusted during docker-entrypoint-initdb.d.
python3 /usr/local/bin/load_contract_citations.py \
  --csv "${CSV}" \
  --dsn "postgresql://${POSTGRES_USER}@/${POSTGRES_DB}?host=/var/run/postgresql"

echo "Citations load finished."
touch /var/lib/postgresql/data/.lucky_parking_init_done
