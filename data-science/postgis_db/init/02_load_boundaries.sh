#!/bin/bash
set -euo pipefail

# Runs once on first container start (empty data volume).
# Loads certified neighborhood councils and LA County zip codes into separate tables.

# Socket auth is trusted during docker-entrypoint-initdb.d; avoid TCP/password.
PG_CONN="PG:dbname=${POSTGRES_DB} user=${POSTGRES_USER}"

echo "Loading neighborhood_councils..."
ogr2ogr \
  -f PostgreSQL \
  "${PG_CONN}" \
  /data/neighborhood_councils.geojson \
  -nln neighborhood_councils \
  -nlt PROMOTE_TO_MULTI \
  -t_srs EPSG:4326 \
  -lco GEOMETRY_NAME=geom \
  -lco FID=gid \
  -lco PRECISION=NO \
  -overwrite \
  --config PG_USE_COPY YES

echo "Loading zipcodes..."
ogr2ogr \
  -f PostgreSQL \
  "${PG_CONN}" \
  /data/zipcodes.geojson \
  -nln zipcodes \
  -nlt PROMOTE_TO_MULTI \
  -t_srs EPSG:4326 \
  -lco GEOMETRY_NAME=geom \
  -lco FID=gid \
  -lco PRECISION=NO \
  -overwrite \
  --config PG_USE_COPY YES

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

ANALYZE neighborhood_councils;
ANALYZE zipcodes;

SELECT
  (SELECT count(*) FROM neighborhood_councils) AS neighborhood_councils,
  (SELECT count(*) FROM zipcodes) AS zipcodes;
SQL

echo "Boundary tables ready."
