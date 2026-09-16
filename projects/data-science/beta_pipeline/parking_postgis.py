"""PostGIS-backed store for LA parking citations (Docker-friendly).

Bulk-loads from the city's CSV dump into PostgreSQL + PostGIS. Reuses the CSV
streaming and normalization logic from ``parking_db``.

CLI:
    python parking_postgis.py init
    python parking_postgis.py load-csv Parking_Citations_20250811.csv
    python parking_postgis.py stats

Requires a running PostGIS instance — see ``docker-compose.yml``.
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import time
from pathlib import Path
from typing import Any

import psycopg
from psycopg.rows import dict_row

from parking_db import COLUMNS, _csv_batches, _normalize_csv_batch

try:
    from dotenv import load_dotenv as _load_dotenv

    _load_dotenv(Path(__file__).with_name(".env"))
except ImportError:
    pass

DEFAULT_DATABASE_URL = "postgresql://parking:parking@localhost:5432/parking"
DATABASE_URL_ENV = "DATABASE_URL"

ATTR_COLUMNS = list(COLUMNS)

SCHEMA_SQL = """
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS citations (
    ticket_number         TEXT PRIMARY KEY,
    issue_date            TEXT,
    issue_time            TEXT,
    meter_id              TEXT,
    marked_time           TEXT,
    rp_state_plate        TEXT,
    plate_expiry_date     TEXT,
    vin                   TEXT,
    make                  TEXT,
    body_style            TEXT,
    color                 TEXT,
    location              TEXT,
    route                 TEXT,
    agency                INTEGER,
    violation_code        TEXT,
    violation_description TEXT,
    fine_amount           DOUBLE PRECISION,
    agency_desc           TEXT,
    color_desc            TEXT,
    body_style_desc       TEXT,
    loc_lat               DOUBLE PRECISION,
    loc_long              DOUBLE PRECISION,
    geocodelocation       TEXT,
    geom                  geometry(Point, 4326)
);

CREATE TABLE IF NOT EXISTS sync_log (
    id              SERIAL PRIMARY KEY,
    started_at      TIMESTAMPTZ NOT NULL,
    finished_at     TIMESTAMPTZ,
    source          TEXT NOT NULL,
    rows_inserted   INTEGER DEFAULT 0,
    notes           TEXT
);
"""

INDEX_SQL = """
CREATE INDEX IF NOT EXISTS idx_citations_issue_date
    ON citations (issue_date);
CREATE INDEX IF NOT EXISTS idx_citations_violation_code
    ON citations (violation_code);
CREATE INDEX IF NOT EXISTS idx_citations_make ON citations (make);
CREATE INDEX IF NOT EXISTS idx_citations_geom
    ON citations USING GIST (geom);
"""

INSERT_SQL = """
INSERT INTO citations (
    ticket_number, issue_date, issue_time, meter_id, marked_time,
    rp_state_plate, plate_expiry_date, vin, make, body_style,
    color, location, route, agency, violation_code,
    violation_description, fine_amount, agency_desc, color_desc,
    body_style_desc, loc_lat, loc_long, geocodelocation, geom
)
VALUES (
    %(ticket_number)s, %(issue_date)s, %(issue_time)s, %(meter_id)s,
    %(marked_time)s, %(rp_state_plate)s, %(plate_expiry_date)s, %(vin)s,
    %(make)s, %(body_style)s, %(color)s, %(location)s, %(route)s,
    %(agency)s, %(violation_code)s, %(violation_description)s,
    %(fine_amount)s, %(agency_desc)s, %(color_desc)s, %(body_style_desc)s,
    %(loc_lat)s, %(loc_long)s, %(geocodelocation)s,
    COALESCE(
        ST_GeomFromText(NULLIF(%(geocodelocation)s, ''), 4326),
        CASE
            WHEN %(loc_lat)s IS NOT NULL AND %(loc_long)s IS NOT NULL
            THEN ST_SetSRID(ST_MakePoint(%(loc_long)s, %(loc_lat)s), 4326)
        END
    )
)
ON CONFLICT (ticket_number) DO NOTHING
"""


def database_url(explicit: str | None = None) -> str:
    return explicit or os.getenv(DATABASE_URL_ENV) or DEFAULT_DATABASE_URL


def connect(dsn: str | None = None, *, autocommit: bool = False) -> psycopg.Connection:
    return psycopg.connect(database_url(dsn), autocommit=autocommit)


def init_db(dsn: str | None = None) -> None:
    """Create PostGIS extension, tables, and indexes (idempotent)."""
    with connect(dsn) as conn:
        with conn.cursor() as cur:
            cur.execute(SCHEMA_SQL)
            cur.execute(INDEX_SQL)
        conn.commit()


def _row_to_params(row: tuple[Any, ...]) -> dict[str, Any]:
    return dict(zip(ATTR_COLUMNS, row, strict=True))


def bulk_load_csv(
    csv_path: str | Path,
    dsn: str | None = None,
    *,
    batch_size: int = 100_000,
    progress: bool = True,
) -> int:
    """Stream a Parking_Citations CSV into PostGIS. Returns rows processed."""
    init_db(dsn)
    url = database_url(dsn)
    started = time.time()
    started_iso = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(started))

    total = 0
    with psycopg.connect(url) as conn:
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO sync_log (started_at, source) VALUES (%s, 'csv') "
                "RETURNING id",
                (started_iso,),
            )
            log_id = cur.fetchone()[0]
            conn.commit()

            # Faster bulk ingest; safe because we only append new batches.
            cur.execute("SET synchronous_commit = OFF")

            for i, batch in enumerate(_csv_batches(csv_path, batch_size), start=1):
                params = [
                    _row_to_params(row)
                    for row in _normalize_csv_batch(batch).iter_rows()
                ]
                cur.executemany(INSERT_SQL, params)
                conn.commit()
                total += len(params)
                if progress:
                    elapsed = time.time() - started
                    rate = total / elapsed if elapsed else 0
                    print(
                        f"  batch {i}: +{len(params):,}  total={total:,}  "
                        f"elapsed={elapsed:.1f}s  rate={rate:,.0f} rows/s",
                        flush=True,
                    )

            cur.execute(
                "UPDATE sync_log SET finished_at = %s, rows_inserted = %s "
                "WHERE id = %s",
                (time.strftime("%Y-%m-%dT%H:%M:%SZ"), total, log_id),
            )
            conn.commit()
    return total


def db_stats(dsn: str | None = None) -> dict[str, Any]:
    with connect(dsn) as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute("SELECT COUNT(*) AS n FROM citations")
            count = cur.fetchone()["n"]
            cur.execute(
                "SELECT COUNT(*) AS n FROM citations WHERE geom IS NOT NULL"
            )
            with_geom = cur.fetchone()["n"]
            cur.execute("SELECT MAX(issue_date) AS d FROM citations")
            max_date = cur.fetchone()["d"]
            cur.execute(
                "SELECT source, started_at, finished_at, rows_inserted, notes "
                "FROM sync_log ORDER BY id DESC LIMIT 1"
            )
            last_sync = cur.fetchone()
    return {
        "row_count": count,
        "rows_with_geom": with_geom,
        "max_issue_date": max_date,
        "last_sync": last_sync,
    }


def _build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    p.add_argument(
        "--database-url",
        default=None,
        help=f"Postgres DSN (default: {DATABASE_URL_ENV} env or docker default)",
    )
    sub = p.add_subparsers(dest="cmd", required=True)

    sub.add_parser("init", help="Create PostGIS schema and indexes.")

    p_load = sub.add_parser("load-csv", help="Bulk-load CSV into PostGIS.")
    p_load.add_argument("csv", help="Path to Parking_Citations CSV")
    p_load.add_argument("--batch-size", type=int, default=100_000)
    p_load.add_argument(
        "--clean",
        action="store_true",
        help="Rebuild citations_clean after load (see parking_pipeline.py).",
    )

    sub.add_parser("stats", help="Show DB stats.")
    return p


def main(argv: list[str] | None = None) -> int:
    args = _build_parser().parse_args(argv)
    dsn = args.database_url
    if args.cmd == "init":
        init_db(dsn)
        print(f"Initialized PostGIS at {database_url(dsn)}")
    elif args.cmd == "load-csv":
        n = bulk_load_csv(args.csv, dsn, batch_size=args.batch_size)
        print(f"Loaded {n:,} rows into {database_url(dsn)}")
        if args.clean:
            from parking_clean import drop_incomplete, rebuild_clean

            rebuild_clean(dsn)
            drop_incomplete(dsn)
    elif args.cmd == "stats":
        print(json.dumps(db_stats(dsn), indent=2, default=str))
    return 0


if __name__ == "__main__":
    sys.exit(main())
