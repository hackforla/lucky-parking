"""Build a cleaned citations table from raw PostGIS ``citations`` rows.

Reads the full raw table populated by ``parking_postgis`` and writes
``citations_clean`` with a combined issue timestamp, trimmed text fields,
and geometry copied from the source row.

CLI:
    python parking_clean.py init
    python parking_clean.py rebuild
    python parking_clean.py stats
"""
from __future__ import annotations

import argparse
import json
import sys
import time
from typing import Any

from parking_postgis import connect, database_url, init_db

CLEAN_TABLE = "citations_clean"

CLEAN_SCHEMA_SQL = f"""
CREATE TABLE IF NOT EXISTS {CLEAN_TABLE} (
    ticket_number         TEXT PRIMARY KEY,
    issue_datetime        TIMESTAMPTZ NOT NULL,
    violation_code        TEXT,
    violation_description TEXT,
    fine_amount           DOUBLE PRECISION,
    geom                  geometry(Point, 4326)
);
"""

CLEAN_INDEX_SQL = f"""
CREATE INDEX IF NOT EXISTS idx_{CLEAN_TABLE}_issue_datetime
    ON {CLEAN_TABLE} (issue_datetime);
CREATE INDEX IF NOT EXISTS idx_{CLEAN_TABLE}_violation_code
    ON {CLEAN_TABLE} (violation_code);
CREATE INDEX IF NOT EXISTS idx_{CLEAN_TABLE}_geom
    ON {CLEAN_TABLE} USING GIST (geom);
"""

# issue_time is HHMM without leading zeros (e.g. "904" -> 09:04, "1430" -> 14:30).
# issue_date is ISO text from the CSV loader (e.g. "2025-04-26T00:00:00.000").
REBUILD_SQL = f"""
INSERT INTO {CLEAN_TABLE} (
    ticket_number,
    issue_datetime,
    violation_code,
    violation_description,
    fine_amount,
    geom
)
SELECT
    ticket_number,
    (
        CAST(issue_date AS TIMESTAMP)::DATE +
        CASE
            WHEN issue_time IS NOT NULL
                 AND BTRIM(issue_time) ~ '^\\d{{1,4}}$'
            THEN MAKE_INTERVAL(
                hours => CAST(
                    SUBSTRING(LPAD(BTRIM(issue_time), 4, '0') FROM 1 FOR 2) AS INTEGER
                ),
                mins => CAST(
                    SUBSTRING(LPAD(BTRIM(issue_time), 4, '0') FROM 3 FOR 2) AS INTEGER
                )
            )
            ELSE INTERVAL '0'
        END
    )::TIMESTAMPTZ AS issue_datetime,
    NULLIF(BTRIM(violation_code), '') AS violation_code,
    NULLIF(BTRIM(violation_description), '') AS violation_description,
    fine_amount,
    geom
FROM citations
WHERE ticket_number IS NOT NULL
  AND issue_date IS NOT NULL
"""


def init_clean(dsn: str | None = None) -> None:
    """Ensure raw + cleaned schemas exist (idempotent)."""
    init_db(dsn)
    with connect(dsn) as conn:
        with conn.cursor() as cur:
            cur.execute(CLEAN_SCHEMA_SQL)
            cur.execute(CLEAN_INDEX_SQL)
        conn.commit()


def rebuild_clean(dsn: str | None = None, *, progress: bool = True) -> int:
    """Replace ``citations_clean`` from ``citations``. Returns row count."""
    init_clean(dsn)
    started = time.time()
    if progress:
        print(f"Rebuilding {CLEAN_TABLE} at {database_url(dsn)} …", flush=True)

    with connect(dsn) as conn:
        with conn.cursor() as cur:
            cur.execute(f"TRUNCATE {CLEAN_TABLE}")
            cur.execute(REBUILD_SQL)
            cur.execute(f"SELECT COUNT(*) FROM {CLEAN_TABLE}")
            count = cur.fetchone()[0]
        conn.commit()

    if progress:
        elapsed = time.time() - started
        rate = count / elapsed if elapsed else 0
        print(
            f"  {count:,} rows in {CLEAN_TABLE}  "
            f"elapsed={elapsed:.1f}s  rate={rate:,.0f} rows/s",
            flush=True,
        )
    return count


def clean_stats(dsn: str | None = None) -> dict[str, Any]:
    with connect(dsn) as conn:
        with conn.cursor() as cur:
            cur.execute(f"SELECT COUNT(*) FROM {CLEAN_TABLE}")
            count = cur.fetchone()[0]
            cur.execute(
                f"SELECT COUNT(*) FROM {CLEAN_TABLE} WHERE geom IS NOT NULL"
            )
            with_geom = cur.fetchone()[0]
            cur.execute(f"SELECT MAX(issue_datetime) FROM {CLEAN_TABLE}")
            max_dt = cur.fetchone()[0]
            cur.execute(f"SELECT MIN(issue_datetime) FROM {CLEAN_TABLE}")
            min_dt = cur.fetchone()[0]
    return {
        "row_count": count,
        "rows_with_geom": with_geom,
        "min_issue_datetime": min_dt,
        "max_issue_datetime": max_dt,
    }


def _build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    p.add_argument(
        "--database-url",
        default=None,
        help="Postgres DSN (default: DATABASE_URL env or docker default)",
    )
    sub = p.add_subparsers(dest="cmd", required=True)

    sub.add_parser("init", help="Create cleaned-table schema and indexes.")

    sub.add_parser("rebuild", help="Rebuild citations_clean from citations.")

    sub.add_parser("stats", help="Show cleaned-table stats.")
    return p


def main(argv: list[str] | None = None) -> int:
    args = _build_parser().parse_args(argv)
    dsn = args.database_url
    if args.cmd == "init":
        init_clean(dsn)
        print(f"Initialized {CLEAN_TABLE} at {database_url(dsn)}")
    elif args.cmd == "rebuild":
        rebuild_clean(dsn)
    elif args.cmd == "stats":
        print(json.dumps(clean_stats(dsn), indent=2, default=str))
    return 0


if __name__ == "__main__":
    sys.exit(main())
