# PostGIS sized for a small VPS (2 vCPU / 2 GB RAM / 90 GB NVMe).
# First boot: boundary layers, then citations from /raw_data if present.
# postgis/postgis publishes amd64 only; pin platform so Apple Silicon
# can still build/run locally via emulation (VPS is amd64 natively).
FROM --platform=linux/amd64 postgis/postgis:16-3.5

# gdal → ogr2ogr for GeoJSON; Python → contract citations loader.
#
# This base image is Debian 11 (bullseye), which reached end-of-LTS on
# 2026-08-31. Its .deb files have since been withdrawn from deb.debian.org, so
# a fresh build fails: `apt-get update` still succeeds and advertises
# python3.9 3.9.2-1+deb11u7, but fetching it 404s and apt exits 100. Builds
# only appeared to work while the layer was still warm in a local cache.
#
# Staying on bullseye is deliberate. postgis/postgis ships no bookworm/trixie
# build for PostGIS 3.5 on PG16 - 17-3.5 is bullseye too, and the only current
# option (18-3.6, Debian 13) would force a PostgreSQL major upgrade that makes
# existing data directories unreadable. So take packages from
# archive.debian.org, which still serves bullseye:
#   - bullseye-security has no suite on archive.debian.org, so drop it. There
#     will be no further security updates for this release either way; moving
#     to 18-3.6 with a pg_upgrade is the real fix when there is time for it.
#   - Archived Release files are past Valid-Until, hence Check-Valid-Until=0.
# apt.postgresql.org is a separate, still-live repo and is left alone.
RUN set -eux; \
    sed -i \
      -e '/bullseye-security/d' \
      -e 's|http://deb.debian.org/debian|http://archive.debian.org/debian|' \
      /etc/apt/sources.list; \
    apt-get -o Acquire::Check-Valid-Until=false update; \
    apt-get install -y --no-install-recommends \
        gdal-bin \
        python3 \
        python3-pip; \
    pip3 install --no-cache-dir \
        'polars>=1.30,<2' \
        'psycopg[binary]>=3.2,<4'; \
    apt-get clean; \
    rm -rf /var/lib/apt/lists/*

# No POSTGRES_PASSWORD default on purpose: the entrypoint refuses to
# initialize without one, which is safer than baking in a known value.
ENV POSTGRES_DB=lucky_parking \
    POSTGRES_USER=lucky \
    # Checksums help catch NVMe corruption; cheap at this data size.
    POSTGRES_INITDB_ARGS="--data-checksums"

# Reference layers only (citation CSVs stay on a runtime mount / raw_data).
COPY boundaries/neighborhood_councils/neighborhood_councils.geojson /data/neighborhood_councils.geojson
COPY boundaries/zipcodes/zipcodes.geojson /data/zipcodes.geojson
COPY boundaries/council_districts/council_districts.geojson /data/council_districts.geojson
COPY boundaries/neighborhoods/neighborhoods.geojson /data/neighborhoods.geojson
COPY boundaries/places/places.geojson /data/places.geojson

# Portable boundary loader (also used by init/02_load_boundaries.sh).
RUN mkdir -p /usr/local/lib/lucky-parking
COPY scripts/load_boundaries.sh scripts/normalize_boundaries.sql /usr/local/lib/lucky-parking/
COPY scripts/load_contract_citations.py /usr/local/bin/load_contract_citations.py
COPY scripts/postgis-healthcheck.sh /usr/local/bin/postgis-healthcheck.sh
COPY init/01_extensions.sql /docker-entrypoint-initdb.d/01_extensions.sql
COPY init/02_load_boundaries.sh /docker-entrypoint-initdb.d/02_load_boundaries.sh
COPY init/03_load_citations.sh /docker-entrypoint-initdb.d/03_load_citations.sh

# Strip CR before chmod. .gitattributes should already guarantee LF, but a
# contributor cloning on Windows with a stale config would otherwise ship
# CRLF scripts that bash refuses to run. Cheap insurance on first boot.
RUN sed -i 's/\r$//' \
      /usr/local/lib/lucky-parking/load_boundaries.sh \
      /usr/local/lib/lucky-parking/normalize_boundaries.sql \
      /usr/local/bin/postgis-healthcheck.sh \
      /docker-entrypoint-initdb.d/01_extensions.sql \
      /docker-entrypoint-initdb.d/02_load_boundaries.sh \
      /docker-entrypoint-initdb.d/03_load_citations.sh \
  && chmod +x \
      /usr/local/lib/lucky-parking/load_boundaries.sh \
      /usr/local/bin/postgis-healthcheck.sh \
      /docker-entrypoint-initdb.d/02_load_boundaries.sh \
      /docker-entrypoint-initdb.d/03_load_citations.sh

# Memory-safe defaults for a 2 GB VPS (leave headroom for OS + PostGIS).
CMD ["postgres", \
     "-c", "shared_buffers=256MB", \
     "-c", "effective_cache_size=768MB", \
     "-c", "maintenance_work_mem=64MB", \
     "-c", "work_mem=4MB", \
     "-c", "max_connections=40", \
     "-c", "wal_buffers=8MB", \
     "-c", "random_page_cost=1.1", \
     "-c", "checkpoint_completion_target=0.9"]

EXPOSE 5432
# First boot may load ~25M citations; allow a long grace period before unhealthy.
HEALTHCHECK --interval=30s --timeout=5s --retries=5 --start-period=3600s \
  CMD pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB" || exit 1
