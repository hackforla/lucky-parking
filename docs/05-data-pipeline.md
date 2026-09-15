# Data pipeline (beta)

The **`data-science/beta_pipeline/`** directory contains the project's **modern data ingestion stack** — Python tools built on **Polars** for streaming multi-gigabyte CSV files into **SQLite** or **PostGIS**, with optional API sync (SQLite only).

For module-level function reference, also see [`data-science/beta_pipeline/ARCHITECTURE.md`](../data-science/beta_pipeline/ARCHITECTURE.md).

## Design goals

| Goal | How it's achieved |
|------|-------------------|
| Handle ~6 GB CSV without OOM | Polars batched reads (100k rows default) |
| Safe re-runs | `INSERT OR IGNORE` / `ON CONFLICT DO NOTHING` |
| Keep data fresh | Socrata incremental sync (SQLite) |
| Spatial analytics | PostGIS geometry + GiST indexes + clean table |
| Simple local dev | Docker Compose for PostGIS; SQLite is a single file |

## High-level architecture

```mermaid
flowchart TB
    subgraph sources [Sources]
        CSV["Parking_Citations_*.csv"]
        API["Socrata Resource API<br/>4f5p-udkv.json"]
    end

    subgraph shared [Shared parsing — parking_db.py]
        BATCH["_csv_batches()"]
        NORM["_normalize_csv_batch()"]
        COLS["COLUMNS — 23 fields"]
    end

    subgraph sqlite [SQLite path]
        PDB[parking_db.py]
        DB[(parking_citations.db)]
        SYNC[update_from_api]
    end

    subgraph postgis [PostGIS path]
        PPG[parking_postgis.py]
        RAW[(citations)]
        PCL[parking_clean.py]
        CLEAN[(citations_clean)]
        PPL[parking_pipeline.py]
    end

    CSV --> BATCH
    BATCH --> NORM
    NORM --> PDB
    NORM --> PPG
    API --> SYNC
    PDB --> DB
    SYNC --> DB
    PPG --> RAW
    RAW --> PCL
    PCL --> CLEAN
    PPL --> PPG
    PPL --> PCL
```

## Modules

### `parking_db.py` — SQLite + API sync

Standalone module: CSV load, SQLite schema, Socrata incremental sync.

| CLI command | Action |
|-------------|--------|
| `init` | Create tables and indexes |
| `load-csv FILE` | Stream CSV → SQLite |
| `sync` | Incremental API sync (newest first) |
| `stats` | Row counts, max date, last sync |

**Sync algorithm:**

```mermaid
flowchart TD
    Start[offset = 0] --> Fetch[Fetch page ORDER BY :updated_at DESC]
    Fetch --> Empty{Page empty?}
    Empty -->|yes| Done[Caught up]
    Empty -->|no| Check[Find existing ticket_numbers]
    Check --> Insert[INSERT OR IGNORE new rows]
    Insert --> Match{Any ticket on page<br/>already in DB?}
    Match -->|yes| Done
    Match -->|no| Next[offset += page_size]
    Next --> Fetch
```

### `parking_postgis.py` — Raw PostGIS store

Reuses CSV parsing from `parking_db.py`. Adds `geom geometry(Point, 4326)` built at insert time:

1. Prefer WKT from `geocodelocation`
2. Fallback to `ST_MakePoint(loc_long, loc_lat)`

| CLI command | Action |
|-------------|--------|
| `init` | Enable PostGIS extension, create tables |
| `load-csv FILE [--clean]` | Bulk load; optional clean rebuild |
| `stats` | Counts, geometry coverage |

### `parking_clean.py` — Analytics table

Builds slim `citations_clean` from raw `citations`:

- Combines `issue_date` + `issue_time` (HHMM) → `issue_datetime`
- Trims violation text fields
- Keeps ticket, violation, fine, geometry

| CLI command | Action |
|-------------|--------|
| `init` | Create clean table |
| `rebuild` | `TRUNCATE` + full `INSERT` from raw |
| `stats` | Row count, datetime range, geom coverage |

### `parking_pipeline.py` — Orchestration

| CLI command | Action |
|-------------|--------|
| `run FILE` | Load CSV → rebuild clean → print stats |
| `clean` | Rebuild clean only (no CSV load) |

## PostGIS full pipeline

```mermaid
sequenceDiagram
    participant User
    participant Docker as docker compose
    participant PPL as parking_pipeline.py
    participant PPG as parking_postgis.py
    participant PCL as parking_clean.py
    participant PG as PostGIS

    User->>Docker: docker compose up -d
    User->>PPL: run Parking_Citations.csv
    PPL->>PPG: bulk_load_csv()
    loop Each 100k batch
        PPG->>PG: INSERT citations + geom
    end
    PPL->>PCL: rebuild_clean()
    PCL->>PG: TRUNCATE citations_clean
    PCL->>PG: INSERT cleaned rows
    PPL-->>User: JSON stats (raw + clean)
```

## Docker setup

`docker-compose.yml` runs **PostGIS 16**:

| Setting | Value |
|---------|-------|
| Image | `postgis/postgis:16-3.4` |
| Port | `5432:5432` |
| Credentials | `parking` / `parking` / `parking` |
| Volume | `postgis_data` (persistent) |
| Healthcheck | `pg_isready` every 5s |

Default DSN: `postgresql://parking:parking@localhost:5432/parking`

## Environment

| Variable | Used by | Default |
|----------|---------|---------|
| `SOCRATA_APP_TOKEN` | `parking_db.py sync` | none (anonymous API) |
| `DATABASE_URL` | PostGIS modules | local Docker DSN above |

**Gap:** README references `.env.example` but the file is not in the repo yet.

## Python environment

Recommended setup with **uv**:

```bash
cd data-science/beta_pipeline
uv venv --python 3.12 .venv
uv pip install -r requirements.txt jupyter ipykernel --python .venv/bin/python
```

**Dependencies** (`requirements.txt`):

| Package | Role |
|---------|------|
| `polars` | CSV streaming, analytics |
| `python-dotenv` | Load `.env` |
| `psycopg[binary]` | PostGIS driver |
| `pandas`, `numpy`, `matplotlib`, `seaborn`, `geopandas` | Notebooks |

`.venv/` is gitignored.

## Notebooks

| Notebook | Status |
|----------|--------|
| `parking_db_explore.ipynb` | **Active** — Polars exploration of CSV; documents SQLite workflow |
| `violation_analysis.ipynb` | **Stub** — imports only; analysis not written yet |

## Module dependency graph

```
parking_db.py          (standalone)
    ↑
parking_postgis.py     (imports CSV helpers)
    ↑
parking_clean.py       (imports connect, init_db)
    ↑
parking_pipeline.py    (orchestrates load + clean)
```

## Design tradeoffs

| Decision | Benefit | Cost |
|----------|---------|------|
| `INSERT OR IGNORE` | Idempotent bulk loads | Ticket corrections never update existing rows |
| Separate `citations_clean` | Simple analytics schema | Full rebuild on each clean (no incremental upsert) |
| SQLite fast pragmas | Faster bulk load | Less crash safety during load |
| PostGIS `synchronous_commit=OFF` | Faster ingest | Recent commits may be lost on crash |

## Unfinished work

| Feature | Status | Notes |
|---------|--------|-------|
| PostGIS API sync | **Not implemented** | Copy/adapt `update_from_api` from SQLite |
| Incremental clean rebuild | **Not implemented** | Today: full `TRUNCATE` + insert |
| Scheduled automation | **Not implemented** | cron/launchd after CSV download |
| Web app integration | **Not implemented** | No API reads from SQLite/PostGIS |
| `.env.example` | **Missing file** | Documented in README only |
| `violation_analysis.ipynb` | **Empty** | Planned analysis TBD |

## Possible directions

```mermaid
mindmap
  root((beta_pipeline future))
    Sync
      PostGIS API sync
      Unified sync module
    Clean layer
      Incremental upsert
      Materialized views
    Integration
      Next.js API routes
      GraphQL over PostGIS
      Export to Mongo for legacy API
    Ops
      GitHub Action nightly sync
      Cloud RDS / Supabase
      dbt models on citations_clean
    Analysis
      violation_analysis notebook
      dbt metrics
      ML feature store
```

## Quick command reference

**SQLite (no Docker):**

```bash
.venv/bin/python parking_db.py init
.venv/bin/python parking_db.py load-csv Parking_Citations_20260426.csv
.venv/bin/python parking_db.py sync
.venv/bin/python parking_db.py stats
```

**PostGIS:**

```bash
docker compose up -d
.venv/bin/python parking_pipeline.py run Parking_Citations_20250811.csv
.venv/bin/python parking_clean.py stats
```

Replace CSV filenames with your local download from [data.lacity.org](https://data.lacity.org/Transportation/Parking-Citations/4f5p-udkv).

Schema details: [Data sources & schemas](./07-data-sources-and-schemas.md).
