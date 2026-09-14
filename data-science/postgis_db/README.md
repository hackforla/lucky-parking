# postgis_db

PostGIS database packaging for Lucky Parking: boundary layers baked into a Docker image, parking citations loaded last on first boot from a mounted CSV (or restored from a dump), and a data contract describing the app query surface.

Designed to **build and load locally** (or on a larger VPS), then **serve** on a small host (about 2 GB RAM / 90 GB disk) via a database dump restore.

## Quick start (Docker only)

**Requires:** [Docker Desktop](https://www.docker.com/products/docker-desktop/) and one LA citations CSV in `raw_data/Parking_Citations_*.csv` (~5 GB). Download the flat file from the [Parking Citations dataset](https://data.lacity.org/Transportation/Parking-Citations/4f5p-udkv/about_data) on the LA Open Data Portal. No host Python or venv needed to run the stack.

`docker compose up` builds and starts **PostGIS**, then (after the database is healthy on first boot) the **contract API** and **citation explorer**.

| App | URL | Purpose |
|-----|-----|---------|
| Explorer UI | http://localhost:8080 | Spreadsheet + map (region / date filters) |
| Contract API | http://localhost:8000/docs | Chart queries (`/chart`, `/regions`, …) |
| PostGIS | `localhost:5432` | Direct SQL (`lucky` / *generated* / `lucky_parking`) |

`scripts/preflight.sh` writes `postgis_db/.env` with a generated `POSTGRES_PASSWORD` on
first run; compose refuses to start without one. Local compose sets
`ALLOW_UNAUTHENTICATED=1`, so **localhost needs no API key or login**. Anything
reachable from the internet must not — see [Security](#security).

### 1. Add the citations CSV

Download the **Parking Citations** flat file (CSV export) from the [LA Open Data Portal](https://data.lacity.org/Transportation/Parking-Citations/4f5p-udkv/about_data) and place it here (any date in the filename is fine):

```text
postgis_db/raw_data/Parking_Citations_YYYYMMDD.csv
```

### 2. Preflight + start

**One command (recommended)**

**macOS / Linux**

```bash
cd data-science/postgis_db
bash scripts/start.sh
docker compose logs -f postgis
```

**Windows** (Command Prompt or PowerShell — `.cmd` shims, no execution-policy change)

```bat
cd data-science\postgis_db
scripts\start.cmd
docker compose logs -f postgis
```

**Or step by step**

**macOS / Linux**

```bash
cd data-science/postgis_db
bash scripts/preflight.sh
docker compose up -d --build
docker compose logs -f postgis
```

**Windows**

```bat
cd data-science\postgis_db
scripts\preflight.cmd
docker compose up -d --build
docker compose logs -f postgis
```

Leave `logs -f` running on **first boot** until you see `Citations load finished.` (boundaries: minutes; full CSV: often **1–3+ hours**). The API and explorer containers wait until PostGIS reports healthy — which happens only **after** the citations load completes (not when Postgres first accepts connections).

### 3. Smoke test

One command checks containers, every boundary table, a real spatial query, and
both web apps, then prints `PASS`/`FAIL` per check and exits non-zero if
anything failed:

**macOS / Linux**

```bash
bash scripts/smoke_test.sh
```

**Windows**

```bat
scripts\smoke_test.cmd
```

```text
== Database ==
  PASS  zipcodes has 313 rows
  PASS  citations has 25487170 rows
== Contract API ==
  PASS  POST /chart returned a ChartResult (2024-01-12 to 2025-01-12)
== Summary ==
  17 passed, 0 failed
```

Then open the **explorer** at http://localhost:8080. Defaults: **Zip Code → 90024**, dates from **Jan 1 last year → today** (so a 2025 CSV still returns rows when the calendar year has moved on). Try **Neighborhood → Westwood** with the same dates.

### Reset / fresh load

Init scripts run **only on an empty data volume**. This is the single most
common source of "it works on my machine": if a first boot fails halfway, the
volume is no longer empty, so init never re-runs and you are left with a
half-loaded database that no amount of restarting will fix. Wipe and rebuild:

```bash
docker compose down -v          # -v is what deletes the volume
docker compose up -d --build
docker compose logs -f postgis
```

### Optional: host Python (CLI / tests only)

Compose already serves the API and explorer. Use a venv only for `scripts/query_contract.py` or `pytest`:

```bash
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
.venv/bin/pytest tests/test_models.py tests/test_api.py -q
```

Windows: `py -3 -m venv .venv` then `.\.venv\Scripts\pip install -r requirements.txt`.

### Reload boundaries on an existing volume

Init scripts run only on an **empty** data volume:

```bash
docker compose up -d --build
bash scripts/reload_boundaries_docker.sh    # macOS / Linux
scripts\reload_boundaries_docker.cmd        # Windows
```

## Verifying it works for someone else

Running the stack repeatedly on one machine hides first-run bugs, because a
populated Docker volume, a cached image, and an existing `.env` all mask steps
that would fail from scratch. Use this procedure to test as a newcomer would.

### Fast path: verify the whole stack in minutes

The full citation load takes 1–3+ hours, which makes end-to-end testing
impractical. `CITATIONS_LOAD_LIMIT` loads only the first N rows so a complete
clean install finishes in a few minutes. Everything else — boundaries, spatial
joins, API, explorer — behaves identically.

```bash
cd data-science/postgis_db
docker compose down -v                       # discard any existing volume
CITATIONS_LOAD_LIMIT=200000 bash scripts/start.sh
docker compose logs -f postgis                # wait for "Citations load finished."
bash scripts/smoke_test.sh
```

Windows:

```bat
cd data-science\postgis_db
docker compose down -v
set CITATIONS_LOAD_LIMIT=200000
scripts\start.cmd
docker compose logs -f postgis
scripts\smoke_test.cmd
```

Reserve a full-dataset run for when you actually need complete data.

### Clean-room checklist

Simulate a brand-new contributor. The point is that **each step must work
without any state left over from your previous runs**:

1. **Fresh clone, separate directory.** Not a `git pull` in your working copy —
   a clone catches missing-from-git files (a `.gitignore` rule hiding something
   the build needs) and wrong line endings.

   ```bash
   git clone <repo-url> /tmp/lp-clean && cd /tmp/lp-clean/data-science/postgis_db
   ```

2. **Confirm the boundary GeoJSON actually arrived.** All five layers are
   committed, so this should pass immediately. If it does not, the image cannot
   build:

   ```bash
   bash scripts/check_boundaries.sh
   ```

3. **Add the citations CSV** to `raw_data/` — it is gitignored by design (~5 GB),
   so it is the one asset a newcomer must fetch themselves. Verify the download
   link in [step 1 of the quick start](#1-add-the-citations-csv) still works.

4. **Wipe Docker state**, so nothing is reused:

   ```bash
   docker compose down -v
   docker builder prune -f      # forces a real build, not a cache replay
   ```

5. **Run the documented command only.** Do not fix anything by hand. If you
   reach for an undocumented step, that step is a bug in the docs.

6. **Run the smoke test** and confirm it exits 0.

7. **Read your own logs as a stranger would.** `docker compose logs postgis`
   should not contain warnings you have learned to ignore.

### Testing on Windows

Line endings are the main cross-platform hazard. Git for Windows defaults to
`core.autocrlf=true`, which rewrites checked-out files to CRLF; a `.sh` file
with CRLF fails inside a Linux container with `$'\r': command not found`.
[`.gitattributes`](.gitattributes) pins `*.sh`, `*.sql`, and `*.yml` to LF, and
the PostGIS `Dockerfile` also strips CR before `chmod` as a second line of
defence. On the Windows box, confirm the checkout is correct before blaming
Docker:

```powershell
cd data-science\postgis_db
# Should print "lf" for every script. Any "crlf" means .gitattributes was
# missing when you cloned -- re-clone rather than converting by hand.
git ls-files --eol scripts init | Select-String 'w/crlf'
```

Windows-specific things worth checking, none of which reproduce on macOS:

| Area | What to watch for |
|------|-------------------|
| PowerShell version | The `.cmd` shims invoke **Windows PowerShell 5.1**, not PowerShell 7. Scripts here avoid .NET Core-only APIs for that reason. `$PSVersionTable.PSVersion` confirms which you have. |
| Execution policy | Use the `.cmd` shims and you never need `Set-ExecutionPolicy`. |
| OneDrive / synced folders | Files may arrive blocked (`Unblock-File`) and bind mounts can behave oddly. Clone to a plain local path such as `C:\dev\`. |
| Docker backend | WSL2, not Hyper-V. WSL2 caps memory at ~50% of RAM, so on a 16 GB box `COMPOSE_MEM_LIMIT=8g` is already the ceiling — lower it on smaller machines. |
| Path length | Windows caps paths at 260 characters by default. Clone somewhere short. |
| `curl` | PowerShell aliases `curl` to `Invoke-WebRequest`. Use `curl.exe`. |

### Upgrading an existing checkout

Two changes are not backward compatible with a volume created before them:

- **`POSTGRES_PASSWORD` is now required.** Every `docker compose` command fails
  with `required variable POSTGRES_PASSWORD is missing` until `.env` exists.
  Run `bash scripts/preflight.sh` (or `scripts\preflight.cmd`) to generate one.
- **A generated password will not match an old volume.** Postgres bakes the
  password in at initdb time, so an existing volume still expects the old value
  (previously `changeme`) while the API now connects with the new one, giving
  `password authentication failed`. Either put the original password in `.env`,
  or start clean with `docker compose down -v`.

## Windows notes

Windows helpers are **`scripts\*.cmd`** wrappers around the PowerShell scripts (they always use `-ExecutionPolicy Bypass`). You do **not** need `Set-ExecutionPolicy` if you use the `.cmd` files.

| Script | Purpose |
|--------|---------|
| `start.cmd` / `start.sh` | Preflight + `docker compose up -d --build` |
| `preflight.cmd` / `.sh` | Writes `.env`, then boundaries + citations CSV checks |
| `smoke_test.cmd` / `.sh` | End-to-end PASS/FAIL check of a running stack |
| `db-status.cmd` / `.sh` | Row counts + citation date range |
| `gen_secrets.ps1` / `.sh` | Print production credentials for `.env` |
| `reload_boundaries_docker.cmd` | Re-run boundary loader in compose |
| `prod_restore.cmd` | Restore dump into prod compose |

All PowerShell scripts target **Windows PowerShell 5.1** (the version that ships
with Windows), so they avoid .NET Core-only APIs and stay ASCII-only. They also
work unchanged under PowerShell 7.

Direct `.ps1` usage (optional): see [PowerShell execution policy](#powershell-execution-policy-optional) below.

### PowerShell execution policy (optional)

Only needed if you run `.\scripts\*.ps1` directly instead of the `.cmd` shims:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

Or per command: `powershell -ExecutionPolicy Bypass -File .\scripts\check_boundaries.ps1`

**OneDrive:** `Get-ChildItem .\scripts\*.ps1 | Unblock-File`

Use `curl.exe` (not the `curl` alias) for health checks on Windows.

## Layout

```
postgis_db/
├── README.md                 # This file
├── datacontract.yaml         # Query/filter contract (not a physical table DDL)
├── Dockerfile                # PostGIS image (postgis:16-3.5 + boundaries + init)
├── docker-compose.yml        # Local: PostGIS (:5432) + API (:8000) + explorer (:8080)
├── docker-compose.prod.yml   # Production: PostGIS internal + API + web + Caddy TLS
├── Dockerfile.api              # FastAPI + explorer UI image (runs as non-root)
├── constraints.txt                  # Pinned dep resolution for reproducible builds
├── .env.example                     # Env template (credentials, domains, limits)
├── deploy/
│   ├── VPS.md                       # Generic VPS deploy checklist
│   └── Caddyfile                    # TLS reverse proxy for api + explorer
├── dumps/                           # pg_dump files for prod restore (gitignored)
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
│   ├── preflight.sh / .cmd            # .env + boundaries + CSV checks (start here)
│   ├── start.sh / .cmd                # Preflight + compose up
│   ├── smoke_test.sh / .ps1 / .cmd    # End-to-end PASS/FAIL check of a running stack
│   ├── ensure_env.sh / .ps1           # Write .env with a generated DB password
│   ├── gen_secrets.sh / .ps1          # Print production secrets to append to .env
│   ├── db-status.sh / .cmd            # Row counts after load
│   ├── check_boundaries.sh / .ps1 / .cmd
│   ├── check_raw_data.sh / .ps1 / .cmd
│   ├── load_boundaries.sh           # Portable GeoJSON → boundary/place tables (Linux/macOS + Docker)
│   ├── normalize_boundaries.sql     # Column renames / indexes after ogr2ogr
│   ├── reload_boundaries_docker.sh / .ps1 / .cmd
│   ├── prod_restore.sh / .ps1 / .cmd
│   ├── load_citations.sql           # Full-column SQL COPY load (legacy/raw)
│   ├── load_contract_citations.py   # Slim CSV → contract-oriented citations table
│   └── query_contract.py            # CLI for data-contract queries (FastAPI-ready core)
├── lucky_parking/                   # Shared query layer (models + PostGIS service)
│   ├── models.py                    # Pydantic request/response types (datacontract.yaml)
│   ├── regions.py                   # region_type → table whitelist
│   ├── service.py                   # QueryService (DSN + query timeouts)
│   ├── security.py                  # API key / basic auth checks
│   ├── ratelimit.py                 # Per-key sliding-window throttle
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

On **first** start with an empty Postgres volume, `init/02_load_boundaries.sh` runs the portable loader and populates **all** of these tables (fails the boot if any GeoJSON is missing):

| Layer | Source | Features | Table | Geometry |
|-------|--------|----------|-------|----------|
| Neighborhood councils | [LA GeoHub Boundaries MapServer/18](https://maps.lacity.org/lahub/rest/services/Boundaries/MapServer/18) | 99 | `neighborhood_councils` | MultiPolygon |
| LA Times neighborhoods | [stiles LA city neighborhoods](https://stilesdata.com/la-geography/la_city_neighborhoods.geojson) (e.g. Westwood) | 114 | `neighborhoods` | MultiPolygon |
| Zip codes | [LA County GISNET MapServer/391](https://arcgis.gis.lacounty.gov/arcgis/rest/services/DRP/GISNET_Public/MapServer/391) | 313 | `zipcodes` | MultiPolygon |
| City council districts | `boundaries/council_districts/` | 15 | `council_districts` | MultiPolygon |
| Places (POIs) | OpenStreetMap Overpass (museums/galleries/arts centres) + [city cultural centers](https://data.lacity.org/Arts-Culture/Cultural-Centers-Theaters-Historic-Sites-and-Galle/vdjf-if28) | ~257 | `places` | Point |

Polygon layers use `geometry(MultiPolygon, 4326)` with GIST indexes (`ST_MakeValid` on load). `places` uses `geometry(Point, 4326)` for `Place (Radius)` buffers. Some zip codes appear more than once (disjoint parts), so `zip` is indexed but **not** unique.

GeoJSON is `COPY`’d into the image at `/data/<name>.geojson`. Host checkout layout is `boundaries/<name>/<name>.geojson`. Scripts resolve paths from env / repo location — **no machine-specific absolute paths**.

A larger optional file `boundaries/neighborhoods/neighborhoods_comprehensive.geojson` (270 features, city + county named places) is kept on disk but **not** loaded by Docker init.

### Citations (loaded last on first boot, if CSV is present)

| Source | Notes |
|--------|--------|
| [Parking Citations](https://data.lacity.org/Transportation/Parking-Citations/4f5p-udkv/about_data) (LA Open Data Portal) | Export CSV → e.g. `raw_data/Parking_Citations_20260720.csv` (~6 GB, ~25M rows), mounted at `/raw_data` |
| Loader | `init/03_load_citations.sh` → `load_contract_citations.py` (contract schema) |

On **first** start with an empty volume, after boundaries load, init checks that `/raw_data` exists and contains a non-empty `Parking_Citations_*.csv`, then loads the newest match into `public.citations`. Missing folder/CSV **fails init** (container exits). For dump-only deploys, set `SKIP_CITATIONS_LOAD=1`.

## Database tables

Default connection:

- Host: `localhost`
- Port: `5432`
- Database: `lucky_parking`
- User: `lucky`
- Password: whatever `POSTGRES_PASSWORD` is set to in `.env`. There is no
  built-in default — `scripts/preflight.sh` generates one locally, and prod
  compose refuses to start without it.

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

The `lucky_parking` package implements validation + SQL. The CLI (`scripts/query_contract.py`) and contract API (`api.main`) are thin wrappers around the same `QueryService`. The explorer UI (`web_sheet.app`) uses `QueryService` for row-level sheet/map lookups, not the chart aggregations.

### HTTP API (FastAPI) — `api.main`

Chart JSON for `single_data` and `compare_mode`. Interactive schemas at
[http://localhost:8000/docs](http://localhost:8000/docs) when `API_DOCS_PUBLIC=1`
(OpenAPI is the field-level source of truth).

```bash
cd postgis_db
docker compose up -d --build   # PostGIS, then API + explorer after data load
curl -s http://localhost:8000/health
# OpenAPI: http://localhost:8000/docs
```

Optional host-side reload (stop compose `api` first if port 8000 is taken):

```bash
.venv/bin/pip install -r requirements.txt
# Reads .env; or set DATABASE_URL explicitly:
export DATABASE_URL="postgresql://lucky:$POSTGRES_PASSWORD@localhost:5432/lucky_parking"
.venv/bin/uvicorn api.main:app --reload --port 8000
```

#### Authentication

Every route except `/health` requires an `X-API-Key` header matching one of the
comma-separated values in `API_KEYS`:

```bash
curl -s -H "X-API-Key: $LP_API_KEY" \
  "http://localhost:8000/regions?region_type=Zip%20Code&limit=5"
```

The check **fails closed**: with `API_KEYS` empty and `ALLOW_UNAUTHENTICATED`
unset, every request gets `503`. Local compose sets `ALLOW_UNAUTHENTICATED=1`
to skip it. See [Security](#security) for issuing and revoking keys.

#### Endpoints

| Method | Path | Auth | Params / body |
|--------|------|------|----------------|
| GET | `/health` | no | `{ "status": "ok" }` — process is up (does not ping Postgres) |
| GET | `/chart-types` | key | JSON array of valid `chart_type` strings |
| GET | `/regions` | key | Query: `region_type` (required), `limit` (1–5000, default 500) |
| POST | `/chart` | key | `SingleDataRequest` JSON |
| POST | `/chart/compare` | key | `CompareModeRequest` JSON |

#### Request fields

Shared on both POSTs:

| Field | Required | Notes |
|-------|----------|--------|
| `region_type` | yes | One of: `Neighborhood Council`, `Neighborhood`, `Zip Code`, `City Council District`, `Place (Radius)` |
| `date_min` / `date_max` | yes | `YYYY-MM-DD`. `date_min` ≤ `date_max`; span ≤ 3660 days |
| `chart_type` | no | Default `Total # Citations`. Also: `Citations per Sq. Mile (Density)`, `Violation Type`, `Total $ Fine Amount`, `Fine $ Amount per Sq. Mile (Density)`, `Day of the Week` |
| `radius_meters` | no | Default `500`. **Only** for `Place (Radius)` (1–50000). Sending a non-default value for other region types returns 422 |

Single (`POST /chart`): `region` (required) — name/zip/district/place matching the boundary table.

Compare (`POST /chart/compare`): `region_1` and `region_2` (required, must differ after trim/casefold). Same `region_type` for both.

#### Response (`ChartResult`)

```json
{
  "mode": "single",
  "region_type": "Zip Code",
  "chart_type": "Total # Citations",
  "date_min": "2024-01-01",
  "date_max": "2024-12-31",
  "region": "90024",
  "region_1": null,
  "region_2": null,
  "radius_meters": null,
  "rows": [{ "label": "90024", "value": 33948, "count": 33948 }],
  "meta": {}
}
```

Compare sets `mode` to `"compare"`, fills `region_1` / `region_2`, and `rows` has one entry per region (or more for breakdowns such as violation type / day of week).

#### Errors

JSON body is `{ "error": ... }`.

| Status | When |
|--------|------|
| 401 | Missing or invalid `X-API-Key` |
| 404 | Region name not found for that `region_type` |
| 422 | Invalid JSON / enum, date order, identical compare regions, `radius_meters` on a non-place type |
| 429 | Rate limit exceeded; `Retry-After` header gives seconds to wait |
| 503 | PostGIS unreachable, query timed out, or the server has no credentials configured |
| 500 | Unexpected server error |

Only `404` and `422` describe your request. `503` and `500` are deliberately
opaque (`"Database unavailable"`, `"Internal server error"`) because driver
messages carry the database host, user, and SQL fragments; the full detail goes
to the container log instead. Check it with
`docker compose logs api` / `docker compose logs web`.

#### Examples

Single region:

```bash
curl -s http://localhost:8000/health
curl -s http://localhost:8000/chart-types
curl -s "http://localhost:8000/regions?region_type=Zip%20Code&limit=5"

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

Compare two neighborhoods:

```bash
curl -s http://localhost:8000/chart/compare \
  -H "Content-Type: application/json" \
  -d '{
    "region_type": "Neighborhood",
    "region_1": "Westwood",
    "region_2": "Hollywood",
    "date_min": "2024-01-01",
    "date_max": "2024-12-31",
    "chart_type": "Total # Citations"
  }'
```

Place (Radius):

```bash
curl -s http://localhost:8000/chart \
  -H "Content-Type: application/json" \
  -d '{
    "region_type": "Place (Radius)",
    "region": "Natural History Museum",
    "date_min": "2024-01-01",
    "date_max": "2024-12-31",
    "chart_type": "Total # Citations",
    "radius_meters": 500
  }'
```

Production compose also publishes this API at `:8000`. See [deploy/VPS.md](deploy/VPS.md).

### Citation explorer UI — `web_sheet.app`

**Not** the contract chart API. Served by compose `web` on `:8080` after PostGIS is healthy. Toggle **Single-region** or **Compare mode**; live autocomplete (5 alphabetical matches); Place (Radius) shows a radius field.

```bash
docker compose up -d --build
# Open http://localhost:8080
```

Host-side reload (optional; stop compose `web` first):

```bash
cd postgis_db
.venv/bin/uvicorn web_sheet.app:app --reload --port 8080
```

Default row cap is 1000 (form, max 10 000). Autocomplete: `GET /api/regions/suggest?region_type=...&q=...&limit=5` (this path is on the **explorer**, not on `:8000`). OpenAPI is disabled on this app (`docs_url=None`).

Pages are behind **HTTP basic auth** (`WEB_USER` / `WEB_PASSWORD`), so the
browser prompts on first visit. Static assets under `/static` stay public since
they carry no citation data. Local compose sets `ALLOW_UNAUTHENTICATED=1` and
skips the prompt.

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

# Unit tests (no DB) — models, routes, auth, rate limiting, error sanitising
.venv/bin/pytest tests/test_models.py tests/test_api.py tests/test_security.py -q

# Integration tests (PostGIS running, boundaries loaded; citations optional)
.venv/bin/pytest tests/test_service_integration.py -m integration -q
```

`Place (Radius)` accepts `--radius-meters` (default 500). Region names must match boundary/place tables exactly.

## Local usage

Requires Docker Desktop (or compatible engine). On Apple Silicon the PostGIS image is pinned to `linux/amd64` (Hub tags are amd64-only). Host-side scripts: `.sh` on macOS/Linux, `.ps1` on Windows.

```bash
cd data-science/postgis_db

# Preflight (portable; paths relative to this repo)
bash scripts/preflight.sh

# First empty volume: ALL boundary/place tables, then citations from raw_data/
# API (:8000) and explorer (:8080) start after PostGIS is healthy
# (citations step can take a long time — watch: docker compose logs -f postgis)
docker compose up -d --build
curl -s http://localhost:8000/health
bash scripts/db-status.sh

# The password lives in .env (written by preflight). To rotate it you must also
# recreate the volume, since it is baked in at initdb time:
#   docker compose down -v && docker compose up -d --build

# Shell into psql
docker compose exec -it postgis psql -U lucky -d lucky_parking
```

Windows:

```bat
cd data-science\postgis_db
scripts\preflight.cmd
docker compose up -d --build
curl.exe -s http://localhost:8000/health
scripts\db-status.cmd
docker compose exec -it postgis psql -U lucky -d lucky_parking
```

Verify after init finishes (`scripts/db-status.sh` / `scripts\db-status.cmd`, or):

```sql
SELECT
  (SELECT count(*) FROM neighborhood_councils) AS neighborhood_councils,
  (SELECT count(*) FROM neighborhoods) AS neighborhoods,
  (SELECT count(*) FROM zipcodes) AS zipcodes,
  (SELECT count(*) FROM council_districts) AS council_districts,
  (SELECT count(*) FROM places) AS places,
  (SELECT count(*) FROM citations) AS citations;
```

Expected boundary counts (approx.): councils 99, neighborhoods 114, zipcodes 313, council districts 15, places ~257.

### Re-load boundaries on an existing volume

Init scripts only run on an **empty** data volume. If a volume was created before all layers were in the image, or you need to refresh boundaries without wiping citations:

```bash
cd data-science/postgis_db
# Rebuild so /data/*.geojson + /usr/local/lib/lucky-parking/load_boundaries.sh are current
docker compose up -d --build
bash scripts/reload_boundaries_docker.sh
```

Windows:

```bat
docker compose up -d --build
scripts\reload_boundaries_docker.cmd
```

Same loader, host Postgres + GDAL (no Docker), using the repo tree — **macOS/Linux** (needs `ogr2ogr` and `psql` on PATH; use Git Bash or WSL on Windows):

```bash
cd data-science/postgis_db
export PGHOST=localhost PGPORT=5432
export POSTGRES_DB=lucky_parking POSTGRES_USER=lucky
export POSTGRES_PASSWORD='<the value from .env>'
bash scripts/load_boundaries.sh
# or explicitly: BOUNDARIES_DIR="$(pwd)/boundaries" bash scripts/load_boundaries.sh
```

### Re-load or smoke-test citations manually

Init only runs on an empty volume. To re-run the contract loader later (or test with `--limit`):

```bash
cd data-science/postgis_db
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
.venv/bin/python scripts/load_contract_citations.py
.venv/bin/python scripts/load_contract_citations.py --limit 100000
```

Windows:

```powershell
cd data-science\postgis_db
py -3 -m venv .venv
.\.venv\Scripts\pip install -r requirements.txt
.\.venv\Scripts\python scripts\load_contract_citations.py
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

Two images:

- **PostGIS** (`Dockerfile` → `lucky-parking-postgis`): `postgis/postgis:16-3.5` (`linux/amd64`), `gdal-bin`, Python + Polars/psycopg for citations, five GeoJSON files in `/data/`, loader in `/usr/local/lib/lucky-parking/`
- **API** (`Dockerfile.api` → `lucky-parking-api`): FastAPI + explorer, running as unprivileged `appuser` (uid 10001) with dependencies pinned by `constraints.txt`. Default `CMD` is `uvicorn api.main:app` on `:8000`. Compose `web` overrides that to `web_sheet.app` on `:8080`.

On **first** start with an empty data volume, PostGIS init runs:

1. `01_extensions.sql` — `postgis`, `postgis_topology`
2. `02_load_boundaries.sh` → `load_boundaries.sh` — **all** of `neighborhood_councils`, `zipcodes`, `council_districts`, `neighborhoods`, `places` (boot fails if any GeoJSON is missing)
3. `03_load_citations.sh` — require `/raw_data` + `Parking_Citations_*.csv`, then load (or `SKIP_CITATIONS_LOAD=1`)

Postgres is not **healthy** until that init finishes. Compose `api` and `web` **wait** on `postgis` healthy, then serve.

- Postgres memory flags in `Dockerfile` `CMD` are sized for a **2 GB** VPS (e.g. `shared_buffers=256MB`)
- Compose `mem_limit` defaults to `8g` locally for PostGIS; on a ~2 GB host use `COMPOSE_MEM_LIMIT=1536m` and prefer dump restore over CSV init

### Boundary loader env vars

| Variable | Purpose |
|----------|---------|
| `BOUNDARY_GEOJSON_DIR` | Flat dir of `<name>.geojson` (Docker default `/data`) |
| `BOUNDARIES_DIR` | Repo tree `boundaries/<name>/<name>.geojson` |
| `PG_CONN` | Optional full GDAL `PG:...` connection string |
| `POSTGRES_DB` / `USER` / `PASSWORD` / `HOST` / `PORT` | DB target (also accepts `PG*` names) |

## Deploy to a small VPS

**Production compose** (`docker-compose.prod.yml`) publishes **only Caddy** on
80/443. PostGIS is not published at all; the API and explorer bind to
`127.0.0.1` so you can `curl` them on the box but nothing outside can reach
them directly. Do not load the CSV on the VPS — restore a local `pg_dump`
instead.

```text
Internet ──443──▶ caddy ──▶ api:8000   (X-API-Key)
                       └──▶ web:8080   (HTTP basic auth)
                                 │ DATABASE_URL (private network)
                                 ▼
                            postgis:5432
```

Full step-by-step: **[deploy/VPS.md](deploy/VPS.md)**

Quick start on the VPS:

```bash
cp .env.example .env
bash scripts/gen_secrets.sh >> .env   # POSTGRES_PASSWORD, API_KEYS, WEB_PASSWORD
nano .env                             # API_DOMAIN, WEB_DOMAIN, ACME_EMAIL
docker compose -f docker-compose.prod.yml up -d --build
bash scripts/prod_restore.sh dumps/lucky_parking.dump
curl -s http://127.0.0.1:8000/health
```

Windows:

```powershell
Copy-Item .env.example .env
.\scripts\gen_secrets.ps1 >> .env
notepad .env                  # API_DOMAIN, WEB_DOMAIN, ACME_EMAIL
docker compose -f docker-compose.prod.yml up -d --build
scripts\prod_restore.cmd dumps\lucky_parking.dump
curl.exe -s http://127.0.0.1:8000/health
```

Both domains must already resolve to the VPS before first start, or Caddy
cannot obtain certificates. Local compose (`docker compose up -d`) skips Caddy
entirely, runs API (:8000) and explorer (:8080) with auth off, and publishes
:5432 for psql.

## Security

Neither app is safe to expose without the settings below; `ALLOW_UNAUTHENTICATED=1`
is a localhost convenience only.

### Contract API keys

`API_KEYS` is a comma-separated list, so **issue one key per consumer** and
revoke by deleting that entry:

```bash
bash scripts/gen_secrets.sh --api-key-only   # prints one lp_… key
# append it to the existing API_KEYS list in .env, then:
docker compose -f docker-compose.prod.yml up -d api
```

Keys are compared in constant time, and only a short hash of the key reaches
the logs or the rate-limit buckets. Give each consumer its key over a channel
that is not the same as where the URL lives.

### Explorer login

`WEB_USER` / `WEB_PASSWORD` drive HTTP basic auth. Basic auth sends the password
on every request, which is only acceptable because Caddy terminates TLS — do
not expose `:8080` directly.

### TLS

Caddy requests and renews Let's Encrypt certificates automatically and persists
them in the `caddy_data` volume. To test the flow without burning rate limits,
uncomment `acme_ca` (staging) in [`deploy/Caddyfile`](deploy/Caddyfile). For a
host with no DNS name, replace the domain blocks with `:443 { tls internal … }`
and accept the self-signed warning. Prefer nginx? Drop the `caddy` service and
proxy to the same `api:8000` / `web:8080` targets.

### Abuse and query limits

| Guard | Default | Env var |
|-------|---------|---------|
| Requests per minute, per key (API) | 60 | `RATE_LIMIT_PER_MINUTE` |
| Requests per minute, per user (explorer) | 30 | `RATE_LIMIT_PER_MINUTE` |
| Connect timeout | 5 s | `DB_CONNECT_TIMEOUT_SECONDS` |
| Per-statement timeout | 15 s | `DB_STATEMENT_TIMEOUT_MS` |

Without the statement timeout a single wide spatial query can hold a connection
open until `max_connections` (40) is exhausted. Unauthenticated requests are
bucketed by client IP instead of key. Counters live in the worker process, so
they are only accurate at `--workers 1`; scaling out needs a shared store.

### Checklist before sharing access

- [ ] `.env` has generated values — no placeholder left in `POSTGRES_PASSWORD`, `API_KEYS`, or `WEB_PASSWORD`
- [ ] `ALLOW_UNAUTHENTICATED` unset or `0`
- [ ] `API_DOCS_PUBLIC` unset or `0` so `/docs` and `/openapi.json` stay off
- [ ] UFW allows only 22, 80, 443 — **never** 5432
- [ ] `https://` works for both domains and `http://` redirects
- [ ] `curl` without a key returns `401`, not data
- [ ] `.env` is not committed (it is gitignored) and `dumps/*.dump` is not either

### Legacy manual restore (dev compose)

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

**Sizing (approximate):** image ~1 GB + DB volume ~11 GB ≈ **12–15 GB** disk — fits a 90 GB disk. RAM is enough to **serve** light queries, not to **load** the full CSV.

Larger tiers (L+ / XL+) are only needed if you want to build and load on the same cloud box.

## Configuration reference

Copy [`.env.example`](.env.example) to `.env` for compose. Host-side `uvicorn` also reads `.env` if `python-dotenv` is installed.

| Variable | Default | Purpose |
|----------|---------|---------|
| `POSTGRES_DB` | `lucky_parking` | Database name |
| `POSTGRES_USER` | `lucky` | Superuser in the image |
| `POSTGRES_PASSWORD` | *none — required* | Compose will not start without it |
| `DATABASE_URL` | built from `POSTGRES_*` | DSN for API, explorer, CLI, loaders. Compose sets `…@postgis:5432/…` |
| `API_KEYS` | *empty* | Comma-separated keys for `X-API-Key`. Empty ⇒ API returns 503 |
| `WEB_USER` / `WEB_PASSWORD` | *empty* | Explorer basic auth. Empty ⇒ explorer returns 503 |
| `ALLOW_UNAUTHENTICATED` | `0` (`1` in local compose) | Disable both auth checks — localhost only |
| `RATE_LIMIT_PER_MINUTE` | `60` API / `30` explorer | Per-key throttle; `0` disables |
| `API_DOCS_PUBLIC` | `0` (`1` in local compose) | Serve `/docs` + `/openapi.json` |
| `DB_CONNECT_TIMEOUT_SECONDS` | `5` | Give up on an unreachable database |
| `DB_STATEMENT_TIMEOUT_MS` | `15000` | Cancel long-running queries |
| `API_DOMAIN` / `WEB_DOMAIN` | *none — required in prod* | Hostnames Caddy issues certificates for |
| `ACME_EMAIL` | *none — required in prod* | Let's Encrypt contact address |
| `API_PORT` / `WEB_PORT` | `8000` / `8080` | Host ports (prod binds them to `127.0.0.1`) |
| `COMPOSE_MEM_LIMIT` | `8g` | Dev PostGIS memory; use `1536m` on a ~2 GB host |
| `COMPOSE_MEM_LIMIT_POSTGIS` | `2560m` | Prod: PostGIS cap on M+ |
| `COMPOSE_MEM_LIMIT_API` / `WEB` | `512m` | Prod: API / web caps |
| `SKIP_CITATIONS_LOAD` | `0` (dev) / `1` (prod) | Skip CSV load on first boot |
| `CITATIONS_LOAD_LIMIT` | *unset (load all)* | Load only the first N citation rows on first boot — use to verify a clean install in minutes |

## Related code elsewhere

- `data-science/beta_pipeline/parking_postgis.py` — alternate Python CSV → PostGIS loader / schema helpers
- `data-science/src/data/upload_neighborhood.py`, `upload_zip.py` — legacy GeoJSON → PostGIS uploads
- Repo root `.gitignore` includes `raw_data/` so citation dumps are not committed
