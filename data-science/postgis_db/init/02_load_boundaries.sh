#!/bin/bash
set -euo pipefail

# Runs once on first container start (empty data volume).
# Loads boundary polygons and place points used by the data contract.

# Socket auth is trusted during docker-entrypoint-initdb.d; avoid TCP/password.
PG_CONN="PG:dbname=${POSTGRES_DB} user=${POSTGRES_USER}"

load_polygons () {
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

load_points () {
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

load_polygons /data/neighborhood_councils.geojson neighborhood_councils
load_polygons /data/zipcodes.geojson zipcodes
load_polygons /data/council_districts.geojson council_districts
load_polygons /data/neighborhoods.geojson neighborhoods
load_points /data/places.geojson places

echo "Normalizing columns, fixing invalid geometries, and indexing..."
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<'SQL'
-- GDAL launders GeoJSON property names to lowercase on import.

-- Neighborhood councils
ALTER TABLE neighborhood_councils RENAME COLUMN objectid TO object_id;
ALTER TABLE neighborhood_councils RENAME COLUMN waddress TO website;
ALTER TABLE neighborhood_councils RENAME COLUMN dwebsite TO empowerla_url;
ALTER TABLE neighborhood_councils RENAME COLUMN demail TO email;
ALTER TABLE neighborhood_councils RENAME COLUMN dphone TO phone;
ALTER TABLE neighborhood_councils RENAME COLUMN service_re TO service_region;
ALTER TABLE neighborhood_councils DROP COLUMN IF EXISTS tooltip;
ALTER TABLE neighborhood_councils DROP COLUMN IF EXISTS nla_url;
ALTER TABLE neighborhood_councils DROP COLUMN IF EXISTS certified;

UPDATE neighborhood_councils
SET geom = ST_Multi(ST_MakeValid(geom));

ALTER TABLE neighborhood_councils
  ALTER COLUMN geom TYPE geometry(MultiPolygon, 4326)
  USING ST_Multi(ST_CollectionExtract(ST_MakeValid(geom), 3))::geometry(MultiPolygon, 4326);

CREATE INDEX IF NOT EXISTS neighborhood_councils_geom_idx
  ON neighborhood_councils USING GIST (geom);
CREATE INDEX IF NOT EXISTS neighborhood_councils_nc_id_idx
  ON neighborhood_councils (nc_id);
CREATE INDEX IF NOT EXISTS neighborhood_councils_name_idx
  ON neighborhood_councils (name);

-- Zip codes
ALTER TABLE zipcodes RENAME COLUMN objectid TO object_id;
ALTER TABLE zipcodes RENAME COLUMN zipcode TO zip;

UPDATE zipcodes
SET geom = ST_Multi(ST_MakeValid(geom));

ALTER TABLE zipcodes
  ALTER COLUMN geom TYPE geometry(MultiPolygon, 4326)
  USING ST_Multi(ST_CollectionExtract(ST_MakeValid(geom), 3))::geometry(MultiPolygon, 4326);

CREATE INDEX IF NOT EXISTS zipcodes_geom_idx
  ON zipcodes USING GIST (geom);
-- Some ZIPs appear more than once (disjoint polygons), so zip is not unique.
CREATE INDEX IF NOT EXISTS zipcodes_zip_idx
  ON zipcodes (zip);

-- City council districts
ALTER TABLE council_districts RENAME COLUMN objectid TO object_id;
ALTER TABLE council_districts DROP COLUMN IF EXISTS tooltip;
ALTER TABLE council_districts DROP COLUMN IF EXISTS nla_url;

UPDATE council_districts
SET geom = ST_Multi(ST_MakeValid(geom));

ALTER TABLE council_districts
  ALTER COLUMN geom TYPE geometry(MultiPolygon, 4326)
  USING ST_Multi(ST_CollectionExtract(ST_MakeValid(geom), 3))::geometry(MultiPolygon, 4326);

CREATE INDEX IF NOT EXISTS council_districts_geom_idx
  ON council_districts USING GIST (geom);
CREATE INDEX IF NOT EXISTS council_districts_district_idx
  ON council_districts (district);
CREATE INDEX IF NOT EXISTS council_districts_name_idx
  ON council_districts (name);

-- LA Times neighborhoods (e.g. Westwood, Hollywood)
ALTER TABLE neighborhoods RENAME COLUMN objectid TO object_id;
ALTER TABLE neighborhoods DROP COLUMN IF EXISTS source_url;
ALTER TABLE neighborhoods DROP COLUMN IF EXISTS fetched_at;

UPDATE neighborhoods
SET geom = ST_Multi(ST_MakeValid(geom));

ALTER TABLE neighborhoods
  ALTER COLUMN geom TYPE geometry(MultiPolygon, 4326)
  USING ST_Multi(ST_CollectionExtract(ST_MakeValid(geom), 3))::geometry(MultiPolygon, 4326);

CREATE INDEX IF NOT EXISTS neighborhoods_geom_idx
  ON neighborhoods USING GIST (geom);
CREATE INDEX IF NOT EXISTS neighborhoods_name_idx
  ON neighborhoods (name);

-- Places / POIs (museums, galleries, cultural centers) for Place (Radius)
ALTER TABLE places
  ALTER COLUMN geom TYPE geometry(Point, 4326)
  USING geom::geometry(Point, 4326);

CREATE INDEX IF NOT EXISTS places_geom_idx
  ON places USING GIST (geom);
CREATE INDEX IF NOT EXISTS places_name_idx
  ON places (name);
CREATE INDEX IF NOT EXISTS places_place_type_idx
  ON places (place_type);

ANALYZE neighborhood_councils;
ANALYZE zipcodes;
ANALYZE council_districts;
ANALYZE neighborhoods;
ANALYZE places;

SELECT
  (SELECT count(*) FROM neighborhood_councils) AS neighborhood_councils,
  (SELECT count(*) FROM zipcodes) AS zipcodes,
  (SELECT count(*) FROM council_districts) AS council_districts,
  (SELECT count(*) FROM neighborhoods) AS neighborhoods,
  (SELECT count(*) FROM places) AS places;
SQL

echo "Boundary tables ready."
