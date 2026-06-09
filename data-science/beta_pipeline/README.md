# LA Parking Citations DB

Tools for loading, syncing, and analyzing the City of Los Angeles
[parking citations dataset](https://data.lacity.org/Transportation/Parking-Citations/4f5p-udkv)
(~6 GB CSV, millions of rows).

Two storage backends share the same CSV parsing logic:

| Backend | Module | Best for |
| --- | --- | --- |
| **SQLite** | `parking_db.py` | Local file DB, incremental API sync |
| **PostGIS** | `parking_postgis.py` + `parking_clean.py` | Spatial queries, cleaned analytics table |

PostGIS adds a **load → clean pipeline** (`parking_pipeline.py`) that builds a slim
`citations_clean` table after each full CSV load.

For module-by-module code breakdown, schemas, and data-flow diagrams, see
**[ARCHITECTURE.md](ARCHITECTURE.md)**.

## Quick start

### 1. Install uv and create the venv

Requires [uv](https://docs.astral.sh/uv/) (manages Python 3.12 and dependencies).

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
source $HOME/.local/bin/env   # add uv to PATH (once per shell)

cd parking
uv venv --python 3.12 .venv
uv pip install -r requirements.txt --python .venv/bin/python
```

Polars ≥1.40 needs **Python 3.10+**; the venv uses 3.12.

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

- `SOCRATA_APP_TOKEN` — optional; raises API rate limits for `parking_db.py sync`
- `DATABASE_URL` — PostGIS connection string (matches `docker-compose.yml`)

### 3. Choose a path

**SQLite (simplest — no Docker):**

```bash
.venv/bin/python parking_db.py load-csv Parking_Citations_20260426.csv
.venv/bin/python parking_db.py sync          # incremental updates
.venv/bin/python parking_db.py stats
```

**PostGIS (spatial + cleaned table):**

```bash
docker compose up -d                         # start PostGIS
.venv/bin/python parking_pipeline.py run Parking_Citations_20250811.csv
.venv/bin/python parking_clean.py stats
```

Replace `Parking_Citations_*.csv` with your actual download filename.

## Project layout

| File | Purpose |
| --- | --- |
| `parking_db.py` | SQLite store + CLI (`init`, `load-csv`, `sync`, `stats`) |
| `parking_postgis.py` | PostGIS raw store + CLI (`init`, `load-csv`, `stats`) |
| `parking_clean.py` | Cleaned table builder (`init`, `rebuild`, `stats`) |
| `parking_pipeline.py` | Orchestrates load → clean (`run`, `clean`) |
| `docker-compose.yml` | Local PostGIS 16 |
| `parking_db_explore.ipynb` | Notebook walkthrough |
| `ARCHITECTURE.md` | Detailed code and schema reference |
| `requirements.txt` | `polars`, `python-dotenv`, `psycopg` |
| `.env` / `.env.example` | Secrets and connection strings |
| `.venv/` | Python 3.12 virtual environment (created by uv) |

Data files (not in repo): `Parking_Citations_*.csv`, `parking_citations.db`.

## SQLite workflow

### Bulk load (one-time)

Streams the CSV in 100k-row Polars batches — the full file is never loaded into
memory. Normalizes `issue_date` to ISO 8601. Safe to re-run (`INSERT OR IGNORE`).

```bash
.venv/bin/python parking_db.py init
.venv/bin/python parking_db.py load-csv Parking_Citations_20260426.csv
.venv/bin/python parking_db.py load-csv Parking_Citations_20260426.csv --batch-size 50000
```

### Incremental sync (recurring)

Fetches from the Socrata API newest-first and stops when a page contains a
`ticket_number` already in the DB.

```bash
.venv/bin/python parking_db.py sync
.venv/bin/python parking_db.py sync --page-size 1000 --max-pages 5   # debug
```

Automate with cron or launchd — each run is cheap when nothing is new.

## PostGIS workflow

### Start the database

```bash
docker compose up -d
docker compose ps    # wait for "healthy"
```

Default connection: `postgresql://parking:parking@localhost:5432/parking`

### Full pipeline (recommended)

Loads raw rows into `citations`, then rebuilds `citations_clean`:

```bash
.venv/bin/python parking_pipeline.py run Parking_Citations_20250811.csv
```

Or step by step:

```bash
.venv/bin/python parking_postgis.py init
.venv/bin/python parking_postgis.py load-csv Parking_Citations_20250811.csv --clean
.venv/bin/python parking_postgis.py stats
.venv/bin/python parking_clean.py rebuild    # refresh clean table only
```

### Cleaned table columns

| Column | Description |
| --- | --- |
| `ticket_number` | Primary key |
| `issue_datetime` | Combined date + time (HHMM, e.g. `"904"` → 09:04) |
| `violation_code` | Trimmed text |
| `violation_description` | Trimmed text |
| `fine_amount` | Numeric fine |
| `geom` | `geometry(Point, 4326)` copied from raw row |

Example query:

```sql
SELECT ticket_number, issue_datetime, violation_description, ST_AsText(geom)
FROM citations_clean
WHERE geom IS NOT NULL
ORDER BY issue_datetime DESC
LIMIT 10;
```

PostGIS API sync is not implemented yet — use SQLite `sync` today, or extend
`parking_postgis.py` with the same Socrata loop from `parking_db.py`.

## Querying

**SQLite with Polars:**

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

**PostGIS via psql:**

```bash
docker compose exec db psql -U parking -d parking \
  -c "SELECT COUNT(*), COUNT(geom) FROM citations_clean;"
```

## Caveats

- **Sync uses `INSERT OR IGNORE`** — corrections to existing tickets are not applied. See [ARCHITECTURE.md](ARCHITECTURE.md) for details.
- **Future-dated rows** exist in the source data; filter in queries if needed.
- **SQLite geospatial** stores lat/long as floats and WKT as text. Use PostGIS for native geometry.
