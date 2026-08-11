#!/bin/bash
# Load (or reload) all contract boundary / place tables into PostGIS.
#
# Populates:
#   neighborhood_councils, zipcodes, council_districts, neighborhoods, places
#
# Designed to run:
#   - during Docker first-boot init (BOUNDARY_GEOJSON_DIR=/data)
#   - inside a running container (same)
#   - on a host with ogr2ogr + psql, using repo-relative paths
#
# No machine-specific absolute paths. Override with env vars as needed:
#   BOUNDARY_GEOJSON_DIR  Flat dir of *.geojson (Docker image default: /data)
#   BOUNDARIES_DIR        Repo-style tree: <dir>/<name>/<name>.geojson
#   PG_CONN               Full GDAL Postgres connection string
#   POSTGRES_DB / USER / PASSWORD / HOST / PORT   (or PG* equivalents)
#
# Examples:
#   BOUNDARY_GEOJSON_DIR=/data ./load_boundaries.sh
#   BOUNDARIES_DIR=./boundaries PGHOST=localhost PGPASSWORD=changeme ./load_boundaries.sh
#   docker compose exec -T postgis env BOUNDARY_GEOJSON_DIR=/data \
#     bash /usr/local/lib/lucky-parking/load_boundaries.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# When copied into the image, normalize SQL sits beside this script.
# When run from the git tree, it lives in scripts/ next to this file.
if [[ -f "${SCRIPT_DIR}/normalize_boundaries.sql" ]]; then
  NORMALIZE_SQL="${SCRIPT_DIR}/normalize_boundaries.sql"
elif [[ -f "${SCRIPT_DIR}/../scripts/normalize_boundaries.sql" ]]; then
  NORMALIZE_SQL="${SCRIPT_DIR}/../scripts/normalize_boundaries.sql"
else
  echo "ERROR: normalize_boundaries.sql not found next to load_boundaries.sh" >&2
  exit 1
fi

# Repo root when this file lives at <repo>/scripts/load_boundaries.sh
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "ERROR: required command not found: $1" >&2
    exit 1
  fi
}

require_cmd ogr2ogr
require_cmd psql

# --- Resolve GeoJSON sources (flat /data vs boundaries/<name>/<name>.geojson) ---
if [[ -z "${BOUNDARY_GEOJSON_DIR:-}" && -z "${BOUNDARIES_DIR:-}" ]]; then
  if [[ -f /data/neighborhoods.geojson ]]; then
    BOUNDARY_GEOJSON_DIR=/data
  elif [[ -f "${REPO_ROOT}/boundaries/neighborhoods/neighborhoods.geojson" ]]; then
    BOUNDARIES_DIR="${REPO_ROOT}/boundaries"
  else
    echo "ERROR: could not find boundary GeoJSON." >&2
    echo "Set BOUNDARY_GEOJSON_DIR (flat *.geojson) or BOUNDARIES_DIR (repo tree)." >&2
    exit 1
  fi
fi

geojson_path() {
  local name="$1"
  if [[ -n "${BOUNDARY_GEOJSON_DIR:-}" ]]; then
    printf '%s/%s.geojson' "${BOUNDARY_GEOJSON_DIR}" "${name}"
  else
    printf '%s/%s/%s.geojson' "${BOUNDARIES_DIR}" "${name}" "${name}"
  fi
}

LAYERS=(
  neighborhood_councils
  zipcodes
  council_districts
  neighborhoods
  places
)

echo "Checking boundary GeoJSON sources..."
for name in "${LAYERS[@]}"; do
  src="$(geojson_path "${name}")"
  if [[ ! -s "${src}" ]]; then
    echo "ERROR: missing or empty GeoJSON for ${name}: ${src}" >&2
    exit 1
  fi
  echo "  OK ${name} <- ${src}"
done

# --- Postgres connection for ogr2ogr (PG:...) and psql ---
POSTGRES_DB="${POSTGRES_DB:-${PGDATABASE:-lucky_parking}}"
POSTGRES_USER="${POSTGRES_USER:-${PGUSER:-lucky}}"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-${PGPASSWORD:-}}"
PGHOST_VAL="${PGHOST:-${POSTGRES_HOST:-}}"
PGPORT_VAL="${PGPORT:-${POSTGRES_PORT:-5432}}"

if [[ -z "${PG_CONN:-}" ]]; then
  if [[ -n "${PGHOST_VAL}" ]]; then
    PG_CONN="PG:host=${PGHOST_VAL} port=${PGPORT_VAL} dbname=${POSTGRES_DB} user=${POSTGRES_USER}"
    if [[ -n "${POSTGRES_PASSWORD}" ]]; then
      PG_CONN="${PG_CONN} password=${POSTGRES_PASSWORD}"
    fi
  else
    # Local socket (Docker initdb / docker exec as postgres OS user)
    PG_CONN="PG:dbname=${POSTGRES_DB} user=${POSTGRES_USER}"
  fi
fi

export PGDATABASE="${POSTGRES_DB}"
export PGUSER="${POSTGRES_USER}"
if [[ -n "${POSTGRES_PASSWORD}" ]]; then
  export PGPASSWORD="${POSTGRES_PASSWORD}"
fi
if [[ -n "${PGHOST_VAL}" ]]; then
  export PGHOST="${PGHOST_VAL}"
fi
if [[ -n "${PGPORT_VAL}" ]]; then
  export PGPORT="${PGPORT_VAL}"
fi

load_polygons() {
  local src="$1"
  local table="$2"
  echo "Loading ${table}..."
  ogr2ogr \
    -f PostgreSQL \
    "${PG_CONN}" \
    "${src}" \
    -nln "${table}" \
    -nlt PROMOTE_TO_MULTI \
    -t_srs EPSG:4326 \
    -lco GEOMETRY_NAME=geom \
    -lco FID=gid \
    -lco PRECISION=NO \
    -overwrite \
    --config PG_USE_COPY YES
}

load_points() {
  local src="$1"
  local table="$2"
  echo "Loading ${table}..."
  ogr2ogr \
    -f PostgreSQL \
    "${PG_CONN}" \
    "${src}" \
    -nln "${table}" \
    -nlt POINT \
    -t_srs EPSG:4326 \
    -lco GEOMETRY_NAME=geom \
    -lco FID=gid \
    -lco PRECISION=NO \
    -overwrite \
    --config PG_USE_COPY YES
}

load_polygons "$(geojson_path neighborhood_councils)" neighborhood_councils
load_polygons "$(geojson_path zipcodes)" zipcodes
load_polygons "$(geojson_path council_districts)" council_districts
load_polygons "$(geojson_path neighborhoods)" neighborhoods
load_points "$(geojson_path places)" places

echo "Normalizing columns, fixing invalid geometries, and indexing..."
psql -v ON_ERROR_STOP=1 -f "${NORMALIZE_SQL}"

echo "Boundary tables ready."
