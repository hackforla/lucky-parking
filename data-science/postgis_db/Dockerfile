# PostGIS for IONOS VPS S+ (2 vCPU / 2 GB RAM / 90 GB NVMe).
# Loads neighborhood_councils and zipcodes on first boot.
# postgis/postgis publishes amd64 only; pin platform so Apple Silicon
# can still build/run locally via emulation (VPS is amd64 natively).
FROM --platform=linux/amd64 postgis/postgis:16-3.5

# Keep the image lean; gdal provides ogr2ogr for GeoJSON → PostGIS.
RUN apt-get update \
    && apt-get install -y --no-install-recommends gdal-bin \
    && rm -rf /var/lib/apt/lists/*

ENV POSTGRES_DB=lucky_parking \
    POSTGRES_USER=lucky \
    POSTGRES_PASSWORD=changeme \
    # Checksums help catch NVMe corruption; cheap at this data size.
    POSTGRES_INITDB_ARGS="--data-checksums"

# Boundary layers only (citation CSVs are excluded via .dockerignore).
COPY boundaries/neighborhood_councils/neighborhood_councils.geojson /data/neighborhood_councils.geojson
COPY boundaries/zipcodes/zipcodes.geojson /data/zipcodes.geojson
COPY init/01_extensions.sql /docker-entrypoint-initdb.d/01_extensions.sql
COPY init/02_load_boundaries.sh /docker-entrypoint-initdb.d/02_load_boundaries.sh

RUN chmod +x /docker-entrypoint-initdb.d/02_load_boundaries.sh

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
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=5 \
  CMD pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB" || exit 1
