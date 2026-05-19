# LA Parking Citations DB

A lightweight SQLite-backed store for the City of Los Angeles
[parking citations dataset](https://data.lacity.org/Transportation/Parking-Citations/4f5p-udkv).

The flat CSV download is bulk-loaded once, then kept fresh from the
[Socrata API](https://dev.socrata.com/foundry/data.lacity.org/4f5p-udkv) by
fetching newest-first and stopping as soon as a `ticket_number` we already
have appears.

## Layout

| File | Purpose |
| --- | --- |
| `parking_db.py` | SQLite logic + CLI (`init`, `load-csv`, `sync`, `stats`). |
| `parking_postgis.py` | PostGIS logic + CLI (`init`, `load-csv`, `stats`). |
| `docker-compose.yml` | Local PostGIS 16 (`postgis/postgis` image). |
| `parking_db_explore.ipynb` | Notebook walkthrough — schema, queries, geospatial demo. |
| `Parking_Citations_*.csv` | The flat-file dump from data.lacity.org. |
| `parking_citations.db` | SQLite database (created on first load). |
| `requirements.txt` | Python deps (`polars`, `python-dotenv`, `psycopg`). |
| `.env` / `.env.example` | Socrata token + `DATABASE_URL` for PostGIS. |

## Setup

The project venv is managed with [`uv`](https://docs.astral.sh/uv/) (no `pip`
inside the venv).

```bash
uv pip install -r requirements.txt
```

Drop your Socrata app token into `.env` (get one at
[data.lacity.org/profile/app_tokens](https://data.lacity.org/profile/app_tokens)):

```
SOCRATA_APP_TOKEN=your_real_token_here
```

The token isn't strictly required — the API works anonymously — but it raises
the rate limit and is recommended for any scheduled sync.

Copy `.env.example` to `.env` and adjust values as needed.

## PostGIS (Docker)

For a spatial database with a native `geometry` column (and a path toward
cloud-hosted Postgres later), use the bundled Docker stack.

### 1. Start PostGIS

Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/).

```bash
docker compose up -d
```

Wait until healthy (`docker compose ps` should show `healthy`). Default
connection (also in `.env.example`):

```
postgresql://parking:parking@localhost:5432/parking
```

### 2. Install Python deps

```bash
uv pip install -r requirements.txt
```

On Windows with a `venv` folder:

```powershell
.\venv\Scripts\python.exe -m pip install -r requirements.txt
```

Set `DATABASE_URL` in `.env` if you change credentials or port.

### 3. Bulk load the CSV

Same streaming pipeline as SQLite — batches via Polars, `issue_date`
normalization, `ON CONFLICT DO NOTHING` on `ticket_number`. Each row also
gets a `geom` column (`geometry(Point, 4326)`) from `geocodelocation` WKT,
falling back to `loc_long` / `loc_lat` when WKT is missing.

```bash
# macOS / Linux
.venv/bin/python parking_postgis.py init
.venv/bin/python parking_postgis.py load-csv Parking_Citations_20250811.csv

# Windows
.\venv\Scripts\python.exe parking_postgis.py init
.\venv\Scripts\python.exe parking_postgis.py load-csv Parking_Citations_20250811.csv
```

Use your actual `Parking_Citations_*.csv` filename. Tune `--batch-size` if
needed. Re-running `load-csv` is safe (duplicates are skipped).

### 4. Verify

```bash
python parking_postgis.py stats
```

Or in `psql` (via Docker):

```bash
docker compose exec db psql -U parking -d parking -c "SELECT COUNT(*), COUNT(geom) FROM citations;"
```

Example spatial query:

```sql
SELECT ticket_number, ST_AsText(geom)
FROM citations
WHERE geom IS NOT NULL
LIMIT 5;
```

API incremental sync for PostGIS is not wired yet — use `parking_db.py sync`
for SQLite today, or extend `parking_postgis.py` with the same Socrata loop.

## Updating the DB (SQLite)

There are two operations: a one-time **bulk load** from the CSV, and a
recurring **sync** from the API.

### 1. Initial bulk load (one-time, ~minutes)

```bash
.venv/bin/python parking_db.py load-csv Parking_Citations_20260426.csv
```

What it does:

- Creates `parking_citations.db` if missing.
- Streams the CSV in 100k-row batches via Polars (memory-safe — the 6.2 GB
  file is never fully loaded).
- Normalizes `issue_date` (`"2025 Apr 26 12:00:00 AM"` → ISO 8601).
- `INSERT OR IGNORE` keyed on `ticket_number`, so re-running is safe.
- Logs the run in the `sync_log` table.

Adjust `--batch-size` if you want to tune memory vs. throughput.
Equivalent from Python:

```python
import parking_db
parking_db.bulk_load_csv("Parking_Citations_20260426.csv", "parking_citations.db")
```

### 2. Incremental sync from the API (recurring)

```bash
.venv/bin/python parking_db.py sync
```

What it does:

- Queries `https://data.lacity.org/resource/4f5p-udkv.json`
  ordered by `:updated_at DESC`, paginating with `$limit` / `$offset`.
- For each page, checks which `ticket_number`s are already in the DB.
- Inserts the new ones via `INSERT OR IGNORE`.
- **Stops as soon as any page contains a `ticket_number` we already have**
  — that's the "we're caught up" signal you asked for.
- Reads `SOCRATA_APP_TOKEN` from `.env` automatically; override with
  `--app-token YOUR_TOKEN` if needed.

Useful flags:

```bash
.venv/bin/python parking_db.py sync --page-size 1000          # default
.venv/bin/python parking_db.py sync --max-pages 5             # cap pages (debug)
.venv/bin/python parking_db.py sync --app-token TOKEN         # override .env
.venv/bin/python parking_db.py sync --db /tmp/test.db         # different DB
```

Equivalent from Python:

```python
import parking_db
result = parking_db.update_from_api("parking_citations.db")
# {'inserted': 247, 'pages': 1, 'caught_up': 1}
```

### 3. Verify

```bash
.venv/bin/python parking_db.py stats
```

Prints row count, the latest `issue_date` in the DB, and the most recent
`sync_log` entry.

### Automate it

To keep the DB fresh you can drop the sync into `cron` (or `launchd`):

```cron
# Every hour at :05
5 * * * * cd /Users/gregpawin/Downloads/parking_db && \
    .venv/bin/python parking_db.py sync >> sync.log 2>&1
```

Each run is cheap when nothing's new — usually one API page and an early exit.

## Schema

A single `citations` table keyed on `ticket_number` (`WITHOUT ROWID`), plus
indexes on `issue_date`, `violation_code`, and `make`. See
[`SCHEMA_SQL`](parking_db.py) in `parking_db.py` for the full DDL.

The `geocodelocation` column is stored as WKT (`POINT (lon lat)`) regardless
of source — the API's GeoJSON `Point` is converted on ingest so the column
shape matches the CSV's format.

A `sync_log` audit table records every load/sync (start, end, source, rows
inserted, notes).

## Querying

Anything that talks to SQLite works. From Python with Polars:

```python
import sqlite3, polars as pl

with sqlite3.connect("parking_citations.db") as conn:
    df = pl.read_database(
        """
        SELECT violation_description, COUNT(*) AS n,
               ROUND(AVG(fine_amount), 2) AS avg_fine
        FROM citations
        WHERE violation_description IS NOT NULL
        GROUP BY violation_description
        ORDER BY n DESC
        LIMIT 15
        """,
        connection=conn,
    )
```

For ad-hoc exploration, the SQLite CLI works fine too:

```bash
sqlite3 parking_citations.db
sqlite> SELECT COUNT(*) FROM citations;
sqlite> SELECT * FROM sync_log ORDER BY id DESC LIMIT 5;
```

## Caveats

- **`:updated_at` vs `:created_at`.** The sync orders by `:updated_at DESC`,
  so it picks up both new records and edits to existing ones. If a back-dated
  correction lands without any genuinely new records, the very first page
  will already contain a known `ticket_number` and the loop exits — that's
  correct "caught up" behavior, but it means corrections aren't applied
  (the table uses `INSERT OR IGNORE`). Switch to `INSERT OR REPLACE` and
  remove the early-exit-on-match if you want corrections to flow through.
- **Future-dated rows.** A handful of rows in the dataset have `issue_date`
  values years in the future. They're stored as-is; filter them out in your
  queries if they're a problem.
- **Geospatial ops.** Lat/long are stored as floats; the WKT column is a
  string. For real geometry operations, install `shapely` / `geopandas`,
  or migrate the DB to [SpatiaLite](https://www.gaia-gis.it/fossil/libspatialite).
