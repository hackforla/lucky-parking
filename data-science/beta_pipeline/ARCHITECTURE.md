# Architecture & Code Reference

This document describes how the LA Parking Citations project is structured:
modules, data flow, schemas, and the key functions in each file.

## Overview

```
Parking_Citations_*.csv  ──►  parking_db.py          ──►  parking_citations.db (SQLite)
                         │
                         └──►  parking_postgis.py    ──►  citations (PostGIS raw)
                                      │
                                      └──►  parking_clean.py  ──►  citations_clean

Socrata API  ──►  parking_db.py sync  ──►  parking_citations.db
```

The city publishes two access paths for the same dataset:

| Source | URL | Used by |
| --- | --- | --- |
| CSV export | data.lacity.org (Transportation → Parking Citations) | `load-csv` in both backends |
| Socrata API | `https://data.lacity.org/resource/4f5p-udkv.json` | `parking_db.py sync` only |

---

## Shared foundations

### Canonical column set

Both backends store the same 23 citation attributes, defined once in
`parking_db.py` as `COLUMNS`:

```
ticket_number, issue_date, issue_time, meter_id, marked_time,
rp_state_plate, plate_expiry_date, vin, make, body_style,
color, location, route, agency, violation_code,
violation_description, fine_amount, agency_desc, color_desc,
body_style_desc, loc_lat, loc_long, geocodelocation
```

`ticket_number` is the primary key everywhere.

### CSV streaming (`parking_db.py`)

The 6+ GB CSV is never loaded whole into memory. Two functions handle ingestion:

#### `_csv_batches(csv_path, batch_size)`

Uses Polars `read_csv_batched` with:

- `POLARS_SCHEMA` — explicit types per column (strings for most fields, `Int32` for `agency`, `Float64` for coordinates and fines)
- `null_values=["", "NA", "N/A"]`
- `ignore_errors=True` — skip malformed rows rather than abort
- Default batch size: **100,000 rows**

Yields one `pl.DataFrame` per batch.

#### `_normalize_csv_batch(df)`

Transforms each batch before insert:

1. Parses `issue_date` from the CSV format `"2025 Apr 26 12:00:00 AM"` using
   `CSV_DATE_FORMAT = "%Y %b %d %I:%M:%S %p"`
2. Writes it back as ISO text: `"2025-04-26T00:00:00.000"`
3. Selects columns in canonical `COLUMNS` order

`issue_time` is **not** combined at CSV load time. It stays as a separate string
(e.g. `"904"`, `"1430"`) and is merged into a timestamp only in the PostGIS clean
step.

### Environment loading

All modules optionally load `.env` from the project directory via `python-dotenv`.
If the package is missing, env vars set in the shell still work.

| Variable | Used by | Default |
| --- | --- | --- |
| `SOCRATA_APP_TOKEN` | `parking_db.py sync` | none (anonymous API access) |
| `DATABASE_URL` | PostGIS modules | `postgresql://parking:parking@localhost:5432/parking` |

---

## `parking_db.py` — SQLite backend

Single-file SQLite database (`parking_citations.db`) with bulk CSV load and
incremental API sync.

### Schema

**`citations`** — all 23 columns, `ticket_number TEXT PRIMARY KEY`, `WITHOUT ROWID`.

**`sync_log`** — audit trail for every load/sync:

| Column | Type | Notes |
| --- | --- | --- |
| `id` | INTEGER PK | Auto-increment |
| `started_at` | TEXT | ISO UTC timestamp |
| `finished_at` | TEXT | Set when run completes |
| `source` | TEXT | `'csv'` or `'api'` |
| `rows_inserted` | INTEGER | Rows processed this run |
| `notes` | TEXT | e.g. `'caught_up'` for API sync |

**Indexes:** `issue_date`, `violation_code`, `make`.

### Key functions

#### `init_db(db_path)`

Idempotent DDL: creates tables and indexes.

#### `bulk_load_csv(csv_path, db_path, *, batch_size, progress)`

1. Calls `init_db`
2. Opens a **fast** connection (`journal_mode=OFF`, `synchronous=OFF`) for throughput
3. Inserts a `sync_log` row with `source='csv'`
4. For each CSV batch: normalize → `executemany(INSERT OR IGNORE)`
5. Updates `sync_log` with row count and finish time
6. Returns total rows processed (including duplicates attempted)

#### `update_from_api(db_path, *, app_token, page_size, max_pages, timeout, progress)`

Incremental sync loop:

```
offset = 0
loop:
    fetch page ordered by :updated_at DESC
    if empty → caught up, break
    find ticket_numbers already in DB
    insert new records (INSERT OR IGNORE)
    if any ticket_number on this page already exists → caught up, break
    offset += page_size
```

**API record mapping** (`_api_record_to_row`):

- Converts Socrata GeoJSON `Point` → WKT via `_geojson_point_to_wkt`
- Coerces `agency`, `fine_amount`, `loc_lat`, `loc_long` with `_coerce`

**HTTP handling** (`_fetch_page`):

- Retries 5xx and network errors with exponential backoff
- Surfaces 4xx errors immediately (e.g. invalid app token with a helpful hint)
- Sends `X-App-Token` header when configured

Returns `{"inserted": N, "pages": P, "caught_up": 0|1}`.

#### `db_stats(db_path)`

Returns row count, max `issue_date`, and the most recent `sync_log` entry.

### CLI

```
python parking_db.py init
python parking_db.py load-csv FILE [--db PATH] [--batch-size N]
python parking_db.py sync [--db PATH] [--app-token TOKEN] [--page-size N] [--max-pages N]
python parking_db.py stats [--db PATH]
```

---

## `parking_postgis.py` — PostGIS raw store

PostgreSQL + PostGIS backend. Reuses `_csv_batches` and `_normalize_csv_batch`
from `parking_db.py` so CSV handling is identical.

### Schema

**`citations`** — same 23 columns as SQLite, plus:

```sql
geom geometry(Point, 4326)
```

**`sync_log`** — same purpose as SQLite, with native `TIMESTAMPTZ` types.

**Indexes:** `issue_date`, `violation_code`, `make`, and a **GiST index on `geom`**.

### Geometry construction (insert time)

Each row's `geom` is built in SQL during insert:

```sql
COALESCE(
    ST_GeomFromText(NULLIF(geocodelocation, ''), 4326),   -- WKT from CSV
    ST_SetSRID(ST_MakePoint(loc_long, loc_lat), 4326)    -- fallback to lat/long
)
```

Priority: WKT string first, then coordinate pair. Rows with neither get `geom = NULL`.

### Key functions

#### `connect(dsn, *, autocommit)`

Wraps `psycopg.connect` with DSN resolution via `database_url()`.

#### `init_db(dsn)`

Creates PostGIS extension, `citations`, `sync_log`, and indexes.

#### `bulk_load_csv(csv_path, dsn, *, batch_size, progress)`

1. Calls `init_db`
2. Logs start in `sync_log`
3. Sets `synchronous_commit = OFF` for faster bulk ingest
4. For each batch: normalize → convert rows to dicts → `executemany(INSERT ... ON CONFLICT DO NOTHING)`
5. Commits per batch, prints progress (batch number, total, rate)
6. Updates `sync_log` on completion

Returns total rows processed.

#### `db_stats(dsn)`

Returns row count, rows with non-null `geom`, max `issue_date`, and last sync log entry.

### CLI

```
python parking_postgis.py init [--database-url DSN]
python parking_postgis.py load-csv FILE [--batch-size N] [--clean]
python parking_postgis.py stats [--database-url DSN]
```

The `--clean` flag calls `parking_clean.rebuild_clean()` after the load finishes.

---

## `parking_clean.py` — Cleaned analytics table

Transforms the raw `citations` table into a slim `citations_clean` table
suited for analysis and mapping.

### Schema

```sql
CREATE TABLE citations_clean (
    ticket_number         TEXT PRIMARY KEY,
    issue_datetime        TIMESTAMPTZ NOT NULL,
    violation_code        TEXT,
    violation_description TEXT,
    fine_amount           DOUBLE PRECISION,
    geom                  geometry(Point, 4326)
);
```

**Indexes:** `issue_datetime`, `violation_code`, GiST on `geom`.

### Datetime combination

Raw data splits date and time across two columns:

| Column | Example | Meaning |
| --- | --- | --- |
| `issue_date` | `2025-04-26T00:00:00.000` | Date (time portion is always midnight from CSV) |
| `issue_time` | `904`, `1430` | Time as HHMM without leading zeros |

The rebuild SQL:

1. Takes the **date** from `issue_date`
2. Parses `issue_time` by left-padding to 4 digits (`904` → `0904`)
3. Extracts hours (first 2 digits) and minutes (last 2 digits)
4. Adds an interval to the date → `TIMESTAMPTZ`

If `issue_time` is missing or non-numeric, the datetime defaults to midnight on
the issue date.

### Text cleaning

- `violation_code` and `violation_description`: `BTRIM`, then `NULLIF` empty strings
- `fine_amount` and `geom`: copied as-is from raw row

### Key functions

#### `init_clean(dsn)`

Calls `init_db` (raw schema) then creates `citations_clean` and its indexes.

#### `rebuild_clean(dsn, *, progress)`

Full refresh strategy:

1. `TRUNCATE citations_clean`
2. `INSERT INTO citations_clean SELECT ... FROM citations WHERE ticket_number IS NOT NULL AND issue_date IS NOT NULL`
3. Returns row count

This is idempotent and safe to re-run after every raw load.

#### `clean_stats(dsn)`

Returns row count, geom coverage, and min/max `issue_datetime`.

### CLI

```
python parking_clean.py init [--database-url DSN]
python parking_clean.py rebuild [--database-url DSN]
python parking_clean.py stats [--database-url DSN]
```

---

## `parking_pipeline.py` — Orchestration

Thin wrapper that chains raw load and clean rebuild.

### `run_pipeline(csv_path, dsn, *, batch_size, skip_load, progress)`

```
if not skip_load:
    bulk_load_csv(csv_path, dsn)     # parking_postgis
rebuild_clean(dsn)                   # parking_clean
return { database_url, raw: db_stats(), clean: clean_stats() }
```

### CLI

```
python parking_pipeline.py run FILE [--batch-size N] [--database-url DSN]
python parking_pipeline.py clean [--database-url DSN]
```

The `clean` subcommand skips CSV load and only rebuilds `citations_clean`.

---

## `docker-compose.yml`

Runs PostGIS 16 on port 5432:

| Setting | Value |
| --- | --- |
| Image | `postgis/postgis:16-3.4` |
| User / password / database | `parking` / `parking` / `parking` |
| Volume | `postgis_data` (persists between restarts) |
| Healthcheck | `pg_isready` every 5s |

---

## Data flow diagrams

### PostGIS full pipeline

```mermaid
flowchart LR
    CSV[Parking_Citations CSV]
    PG[parking_postgis.py]
    RAW[(citations)]
    CL[parking_clean.py]
    CLEAN[(citations_clean)]

    CSV -->|Polars batches| PG
    PG -->|INSERT + geom| RAW
    RAW -->|TRUNCATE + SELECT| CL
    CL --> CLEAN
```

### SQLite sync loop

```mermaid
flowchart TD
    API[Socrata API]
    SYNC[parking_db.py sync]
    DB[(parking_citations.db)]

    API -->|pages newest-first| SYNC
    SYNC -->|INSERT OR IGNORE new rows| DB
    SYNC -->|stop when ticket_number match| SYNC
```

---

## Module dependency graph

```
parking_db.py          (standalone — CSV + SQLite + API)
    ↑
parking_postgis.py     (imports COLUMNS, _csv_batches, _normalize_csv_batch)
    ↑
parking_clean.py       (imports connect, database_url, init_db)
    ↑
parking_pipeline.py    (imports bulk_load_csv, rebuild_clean, stats helpers)
```

`parking_db.py` has no imports from the other modules. The PostGIS stack depends
on it only for CSV parsing shared code.

---

## Design decisions

### Why two backends?

- **SQLite** is zero-infra, supports API sync today, and works well for ad-hoc
  analysis with Polars or the sqlite3 CLI.
- **PostGIS** adds native geometry, GiST spatial indexes, and a cleaned table
  for downstream analytics or cloud migration.

### Why a separate clean table?

Raw `citations` preserves every column from the city export. `citations_clean`
narrows to the fields most useful for analysis, combines split date/time fields
into one timestamp, trims text, and drops rows missing a ticket or date. Rebuilding
via `TRUNCATE + INSERT` keeps the clean step simple and deterministic.

### Why `INSERT OR IGNORE` / `ON CONFLICT DO NOTHING`?

Re-running bulk loads is safe — duplicate `ticket_number`s are skipped. The tradeoff
is that **corrections to existing tickets are not applied** during API sync. To
accept corrections, switch to `INSERT OR REPLACE` / `ON CONFLICT DO UPDATE` and
adjust the sync early-exit logic.

### Performance choices

| Location | Optimization | Risk |
| --- | --- | --- |
| SQLite bulk load | `journal_mode=OFF`, `synchronous=OFF` | Less crash safety during load only |
| PostGIS bulk load | `synchronous_commit=OFF` | Recent commits may be lost on crash |
| CSV reading | 100k-row Polars batches | Tunable via `--batch-size` |

Both bulk loaders commit per batch so progress is not lost mid-run.

---

## Known data quirks

1. **Future-dated `issue_date` values** — a small number of rows have dates years
   ahead. Stored as-is; filter in queries if needed.
2. **`issue_time` format** — HHMM without leading zeros. Values like `"0"` or
   `"0000"` parse as midnight.
3. **Missing geometry** — not every row has coordinates. Check `geom IS NOT NULL`
   for spatial analysis.
4. **API vs CSV shape** — the API returns GeoJSON for location; the CSV has WKT.
   SQLite sync converts GeoJSON → WKT so the column shape is consistent.

---

## Extending the project

Common next steps:

| Goal | Starting point |
| --- | --- |
| PostGIS API sync | Copy `update_from_api` from `parking_db.py`, adapt inserts to include `geom` |
| Incremental clean | Replace `TRUNCATE` with upsert on `ticket_number` for new rows only |
| Scheduled pipeline | cron/launchd calling `parking_pipeline.py run` after each CSV download |
| Cloud Postgres | Point `DATABASE_URL` at RDS/Supabase; same code, no Docker |
