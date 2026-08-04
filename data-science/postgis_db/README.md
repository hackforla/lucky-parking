# postgis_db

PostGIS database packaging for Lucky Parking: boundary layers baked into a Docker image, parking citations loaded last on first boot from a mounted CSV (or restored from a dump), and a data contract describing the app query surface.

Designed to **build and load locally** (or on a larger VPS), then **serve** on a small host such as IONOS VPS S+ (2 GB RAM / 90 GB NVMe) via a database dump restore.

## Layout

```
postgis_db/
├── README.md                 # This file
├── datacontract.yaml         # Query/filter contract (not a physical table DDL)
├── Dockerfile                # postgis/postgis:16-3.5 + boundary GeoJSON + init
├── docker-compose.yml        # Local/VPS run config, volume, mounts
├── .dockerignore             # Keeps raw_data / shapefiles out of the image
├── boundaries/               # Reference geography (GeoJSON + shapefile sidecars)
│   ├── neighborhood_councils/
│   ├── neighborhoods/        # LA Times neighborhoods (e.g. Westwood)
│   ├── zipcodes/
│   ├── council_districts/
│   ├── places/               # Museums / galleries / cultural POIs (points)
│   └── cultural_sites/       # City cultural centers (also merged into places)
├── init/                     # Runs once on empty Postgres data volume
│   ├── 01_extensions.sql
│   ├── 02_load_boundaries.sh
│   └── 03_load_citations.sh  # Last: CSV → citations (if /raw_data has a dump)
├── scripts/
│   ├── load_citations.sql           # Full-column SQL COPY load (legacy/raw)
│   ├── load_contract_citations.py   # Slim CSV → contract-oriented citations table
│   └── query_contract.py            # CLI for data-contract queries (FastAPI-ready core)
├── lucky_parking/                   # Shared query layer (models + PostGIS service)
│   ├── models.py                    # Pydantic request/response types (datacontract.yaml)
│   ├── regions.py                   # region_type → table whitelist
│   ├── service.py                   # QueryService
│   └── errors.py
├── api/
│   └── main.py                      # FastAPI app (uses QueryService)
├── tests/                           # pytest (unit + optional integration)
├── requirements.txt          # Python deps for the loaders (local venv)
└── raw_data/                 # Large CSVs (gitignored); mounted read-only at runtime
    └── Parking_Citations_*.csv
```

## What lives where

| Artifact | Location | In git? | In Docker image? |
|----------|----------|---------|------------------|
| Dockerfile / compose / init / scripts | `postgis_db/` | Yes | Build context (see `.dockerignore`) |
| Boundary GeoJSON | `boundaries/*/*.geojson` | Untracked unless added | **Yes** (`COPY` into `/data`) |
| Boundary shapefiles / zips | `boundaries/*/shapefile`, `*_shapefile.zip` | Untracked unless added | **No** |
| Citation CSV (~6 GB) | `raw_data/` | **No** (`raw_data/` in repo `.gitignore`) | **No** |
| Live Postgres data (~11 GB) | Docker volume `postgis_db_postgis_data` | **No** | **No** (volume only) |
| Data contract | `datacontract.yaml` | Yes | No |

The database itself is **not** a file in this repo. On Docker Desktop it is the named volume `postgis_db_postgis_data`, mounted in the container at `/var/lib/postgresql/data`.

## Data sources

### Boundaries & places (loaded on first container init)

| Layer | Source | Features | Table | Geometry |
|-------|--------|----------|-------|----------|
| Neighborhood councils | [LA GeoHub Boundaries MapServer/18](https://maps.lacity.org/lahub/rest/services/Boundaries/MapServer/18) | 99 | `neighborhood_councils` | MultiPolygon |
| LA Times neighborhoods | [stiles LA city neighborhoods](https://stilesdata.com/la-geography/la_city_neighborhoods.geojson) (e.g. Westwood) | 114 | `neighborhoods` | MultiPolygon |
| Zip codes | [LA County GISNET MapServer/391](https://arcgis.gis.lacounty.gov/arcgis/rest/services/DRP/GISNET_Public/MapServer/391) | 313 | `zipcodes` | MultiPolygon |
| City council districts | `boundaries/council_districts/` | 15 | `council_districts` | MultiPolygon |
| Places (POIs) | OpenStreetMap Overpass (museums/galleries/arts centres) + [city cultural centers](https://data.lacity.org/Arts-Culture/Cultural-Centers-Theaters-Historic-Sites-and-Galle/vdjf-if28) | ~257 | `places` | Point |

Polygon layers use `geometry(MultiPolygon, 4326)` with GIST indexes (`ST_MakeValid` on load). `places` uses `geometry(Point, 4326)` for `Place (Radius)` buffers. Some zip codes appear more than once (disjoint parts), so `zip` is indexed but **not** unique.

A larger optional file `boundaries/neighborhoods/neighborhoods_comprehensive.geojson` (270 features, city + county named places) is kept on disk but **not** loaded by Docker init.

### Citations (loaded last on first boot, if CSV is present)

| Source | Notes |
|--------|--------|
| LA parking citations CSV dump | e.g. `raw_data/Parking_Citations_20260720.csv` (~6 GB, ~25M rows), mounted at `/raw_data` |
| Loader | `init/03_load_citations.sh` → `load_contract_citations.py` (contract schema) |

On **first** start with an empty volume, after boundaries load, init checks that `/raw_data` exists and contains a non-empty `Parking_Citations_*.csv`, then loads the newest match into `public.citations`. Missing folder/CSV **fails init** (container exits). For dump-only deploys, set `SKIP_CITATIONS_LOAD=1`.

## Database tables

Default connection (compose defaults — **change the password** before any public deploy):

- Host: `localhost`
- Port: `5432`
- Database: `lucky_parking`
- User: `lucky`
- Password: `changeme` (override with `POSTGRES_PASSWORD`)

### `neighborhood_councils`

Key columns after init: `gid`, `object_id`, `name`, `nc_id`, `website`, `empowerla_url`, `email`, `phone`, `service_region`, `geom`.

### `zipcodes`

Key columns: `gid`, `object_id`, `zip`, `geom`.

### `council_districts`

Key columns: `gid`, `object_id`, `name`, `district`, `district_name`, `geom`.

### `neighborhoods`

LA Times–style city neighborhoods (Westwood, Hollywood, Venice, …).

Key columns: `gid`, `object_id`, `name`, `area_sqmi`, `geom`.

### `places`

Named points for radius queries (Natural History Museum, Griffith Observatory, LACMA, …).

Key columns: `gid`, `name`, `place_type`, `source`, `website`, `address`, `geom` (`Point`).

### `citations` (contract-oriented schema)

Produced by `scripts/load_contract_citations.py` (replaces any prior wide table):

| Column | Type | Notes |
|--------|------|--------|
| `ticket_number` | `TEXT` PK | Deduped on load |
| `issue_datetime` | `TIMESTAMPTZ` | From CSV `issue_date` + `issue_time` |
| `violation_code` | `TEXT` | Violation Type chart |
| `violation_description` | `TEXT` | Violation Type chart |
| `fine_amount` | `DOUBLE PRECISION` | Fine totals / density |
| `geom` | `geometry(Point, 4326)` | From `loc_lat` / `loc_long`; region joins + density |

Rows missing `issue_datetime` or valid coordinates are dropped. Approximate size after a full slim load is smaller than the wide raw table (on the order of several GB, not ~9 GB).

`scripts/load_citations.sql` remains available if you need the full raw CSV column set instead.

## Data contract (`datacontract.yaml`)

This describes the **application query surface** (filters for single-region and compare-mode charts), not the raw citation table schema.

| Contract field | Role | How the DB supports it |
|----------------|------|-------------------------|
| `region_type` | Enum | `Neighborhood Council`, `Neighborhood`, `Zip Code`, `City Council District`, `Place (Radius)` |
| `region` / `region_1` / `region_2` | Region name/id | Join citation points into polygon tables (`ST_Contains`); for `Place (Radius)`, look up `places.name` and buffer `places.geom` (optional geocoder for names not in `places`) |
| `date_min` / `date_max` | Date range | Derive from `citations.issue_datetime` |
| `chart_type` | Metric enum | Aggregations over filtered citations (counts, fine sums, violation breakdowns, day-of-week, density via `ST_Area` on region polygons) |

Boundary / place tables supply valid region and place lists; `citations` supplies facts for chart metrics.

The `lucky_parking` package implements validation + SQL. The CLI and FastAPI app are thin wrappers around the same `QueryService`.

### HTTP API (FastAPI)

```bash
cd postgis_db
.venv/bin/pip install -r requirements.txt
docker compose up -d   # PostGIS required

.venv/bin/uvicorn api.main:app --reload --port 8000
# Docs: http://localhost:8000/docs
```

| Method | Path | Body / params |
|--------|------|----------------|
| GET | `/health` | — |
| GET | `/chart-types` | — |
| GET | `/regions?region_type=Zip%20Code&limit=50` | — |
| POST | `/chart` | `SingleDataRequest` JSON |
| POST | `/chart/compare` | `CompareModeRequest` JSON |

Example:

```bash
curl -s http://localhost:8000/chart \
  -H "Content-Type: application/json" \
  -d '{
    "region_type": "Zip Code",
    "region": "90024",
    "date_min": "2024-01-01",
    "date_max": "2024-12-31",
    "chart_type": "Total # Citations"
  }'
```

### Query the contract (CLI)

```bash
cd postgis_db
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt

# Valid region names (pick one for --region)
.venv/bin/python scripts/query_contract.py list-regions --region-type "Zip Code" --limit 10

# Single-region chart (JSON matches ChartResult)
.venv/bin/python scripts/query_contract.py query \
  --region-type "Zip Code" \
  --region 90024 \
  --date-min 2024-01-01 \
  --date-max 2024-12-31 \
  --chart-type "Total # Citations"

# Compare two LA Times neighborhoods
.venv/bin/python scripts/query_contract.py query --compare \
  --region-type Neighborhood \
  --region-1 Westwood \
  --region-2 Hollywood \
  --date-min 2024-01-01 --date-max 2024-12-31

# Unit tests (no DB)
.venv/bin/pytest tests/test_models.py tests/test_api.py -q

# Integration tests (PostGIS running, boundaries loaded; citations optional)
.venv/bin/pytest tests/test_service_integration.py -m integration -q
```

`Place (Radius)` accepts `--radius-meters` (default 500). Region names must match boundary/place tables exactly.

## Local usage

Requires Docker Desktop (or compatible engine). On Apple Silicon the image is pinned to `linux/amd64` (PostGIS Hub tags are amd64-only).

```bash
cd data-science/postgis_db

# Preflight: raw_data/ + Parking_Citations_*.csv must exist
bash scripts/check_raw_data.sh

# First empty volume: boundaries, then citations from raw_data/Parking_Citations_*.csv
# (citations step can take a long time — watch: docker compose logs -f)
docker compose up -d --build

# Optional: set a real password
# POSTGRES_PASSWORD='your-secret' docker compose up -d --build

# Shell into psql
docker exec -it lucky-parking-postgis psql -U lucky -d lucky_parking
```

Verify after init finishes:

```sql
SELECT
  (SELECT count(*) FROM neighborhood_councils) AS neighborhood_councils,
  (SELECT count(*) FROM neighborhoods) AS neighborhoods,
  (SELECT count(*) FROM zipcodes) AS zipcodes,
  (SELECT count(*) FROM council_districts) AS council_districts,
  (SELECT count(*) FROM places) AS places,
  (SELECT count(*) FROM citations) AS citations;
```

### Re-load or smoke-test citations manually

Init only runs on an empty volume. To re-run the contract loader later (or test with `--limit`):

```bash
cd data-science/postgis_db
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
.venv/bin/python scripts/load_contract_citations.py
.venv/bin/python scripts/load_contract_citations.py --limit 100000
```

Legacy full-width SQL load is still at `scripts/load_citations.sql`. Wipe and re-init with `docker compose down -v && docker compose up -d --build`.

### Example spatial join

```sql
SELECT nc.name, count(*) AS citations
FROM citations c
JOIN neighborhood_councils nc ON ST_Contains(nc.geom, c.geom)
GROUP BY nc.name
ORDER BY citations DESC
LIMIT 10;
```

## Docker image behavior

- Base: `postgis/postgis:16-3.5` (`linux/amd64`)
- Installs `gdal-bin` (boundaries) and Python + Polars/psycopg (citations)
- On **first** start with an empty data volume:
  1. `01_extensions.sql` — `postgis`, `postgis_topology`
  2. `02_load_boundaries.sh` — GeoJSON → boundary/place tables
  3. `03_load_citations.sh` — require `/raw_data` + `Parking_Citations_*.csv`, then load (or `SKIP_CITATIONS_LOAD=1`)
- Postgres memory flags in `Dockerfile` `CMD` are sized for a **2 GB** VPS (e.g. `shared_buffers=256MB`)
- Compose `mem_limit` defaults to `8g` locally; on S+ use `COMPOSE_MEM_LIMIT=1536m` and prefer dump restore over CSV init

## Deploy to a small VPS (e.g. IONOS S+)

**Do not** rebuild citations from CSV on a 2 GB host. Prepare locally, then restore.

1. Dump locally (custom format recommended):

   ```bash
   docker exec lucky-parking-postgis \
     pg_dump -U lucky -d lucky_parking -Fc -f /tmp/lucky_parking.dump
   docker cp lucky-parking-postgis:/tmp/lucky_parking.dump ./lucky_parking.dump
   ```

2. On the VPS: copy `Dockerfile`, `docker-compose.yml`, `init/`, and boundary GeoJSON needed to **build** the image (or push/pull a prebuilt image). Do **not** bake the dump into the image.

3. Start PostGIS with a tight memory cap and **without** needing the big CSV:

   ```bash
   COMPOSE_MEM_LIMIT=1536m docker compose up -d --build
   ```

4. Restore into the running instance (after first boot finished init, or restore into a fresh volume and skip relying on CSV):

   ```bash
   docker cp lucky_parking.dump lucky-parking-postgis:/tmp/
   docker exec -it lucky-parking-postgis \
     pg_restore -U lucky -d lucky_parking --clean --if-exists /tmp/lucky_parking.dump
   ```

   If restoring a full dump that already includes boundaries, you may prefer an empty volume and restore-only (adjust workflow so init and restore do not fight). Prefer one clear path: either init-boundaries-then-restore-citations-only, or restore a full dump onto a fresh volume.

**Sizing (approximate):** image ~1 GB + DB volume ~11 GB ≈ **12–15 GB** disk — fits S+ 90 GB. RAM is enough to **serve** light queries, not to **load** the full CSV.

Larger tiers (L+ / XL+) are only needed if you want to build and load on the same cloud box.

## Configuration reference

| Variable | Default | Purpose |
|----------|---------|---------|
| `POSTGRES_DB` | `lucky_parking` | Database name |
| `POSTGRES_USER` | `lucky` | Superuser in the image |
| `POSTGRES_PASSWORD` | `changeme` | **Change in production** |
| `COMPOSE_MEM_LIMIT` | `8g` | Container memory; use `1536m` on S+ |

## Related code elsewhere

- `data-science/beta_pipeline/parking_postgis.py` — alternate Python CSV → PostGIS loader / schema helpers
- `data-science/src/data/upload_neighborhood.py`, `upload_zip.py` — legacy GeoJSON → PostGIS uploads
- Repo root `.gitignore` includes `raw_data/` so citation dumps are not committed
