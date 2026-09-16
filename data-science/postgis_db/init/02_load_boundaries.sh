#!/bin/bash
set -euo pipefail

# Runs once on first container start (empty data volume).
# Loads ALL contract boundary / place tables via the portable loader baked
# into the image (see scripts/load_boundaries.sh).
#
# Required GeoJSON (copied into the image at /data/*.geojson):
#   neighborhood_councils, zipcodes, council_districts, neighborhoods, places

export BOUNDARY_GEOJSON_DIR="${BOUNDARY_GEOJSON_DIR:-/data}"
exec /usr/local/lib/lucky-parking/load_boundaries.sh
