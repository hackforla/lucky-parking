"""Lightweight SQLite-backed store for LA parking citations.

Bulk-loads from the city's CSV dump and incrementally syncs the newest records
from the Socrata API at https://dev.socrata.com/foundry/data.lacity.org/4f5p-udkv.

CLI:
    python parking_db.py init
    python parking_db.py load-csv Parking_Citations_20260426.csv
    python parking_db.py sync [--app-token TOKEN]
    python parking_db.py stats
"""
from __future__ import annotations

import argparse
import json
import os
import sqlite3
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from collections.abc import Iterator
from pathlib import Path
from typing import Any

import polars as pl

# Load .env (sitting next to this file) into os.environ if python-dotenv is
# available. Falls through silently if it isn't — env vars set in the shell
# still work.
try:
    from dotenv import load_dotenv as _load_dotenv

    _load_dotenv(Path(__file__).with_name(".env"))
except ImportError:
    pass

DATASET_ID = "4f5p-udkv"
API_URL = f"https://data.lacity.org/resource/{DATASET_ID}.json"
DB_FILENAME = "parking_citations.db"
APP_TOKEN_ENV = "SOCRATA_APP_TOKEN"

# Canonical column order — used everywhere we INSERT.
COLUMNS: tuple[str, ...] = (
    "ticket_number", "issue_date", "issue_time", "meter_id", "marked_time",
    "rp_state_plate", "plate_expiry_date", "vin", "make", "body_style",
    "color", "location", "route", "agency", "violation_code",
    "violation_description", "fine_amount", "agency_desc", "color_desc",
    "body_style_desc", "loc_lat", "loc_long", "geocodelocation",
)

POLARS_SCHEMA: dict[str, pl.DataType] = {
    "ticket_number":         pl.String,
    "issue_date":            pl.String,
    "issue_time":            pl.String,
    "meter_id":              pl.String,
    "marked_time":           pl.String,
    "rp_state_plate":        pl.String,
    "plate_expiry_date":     pl.String,
    "vin":                   pl.String,
    "make":                  pl.String,
    "body_style":            pl.String,
    "color":                 pl.String,
    "location":              pl.String,
    "route":                 pl.String,
    "agency":                pl.Int32,
    "violation_code":        pl.String,
    "violation_description": pl.String,
    "fine_amount":           pl.Float64,
    "agency_desc":           pl.String,
    "color_desc":            pl.String,
    "body_style_desc":       pl.String,
    "loc_lat":               pl.Float64,
    "loc_long":              pl.Float64,
    "geocodelocation":       pl.String,
}

CSV_DATE_FORMAT = "%Y %b %d %I:%M:%S %p"

SCHEMA_SQL = """
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
    fine_amount           REAL,
    agency_desc           TEXT,
    color_desc            TEXT,
    body_style_desc       TEXT,
    loc_lat               REAL,
    loc_long              REAL,
    geocodelocation       TEXT
) WITHOUT ROWID;

CREATE TABLE IF NOT EXISTS sync_log (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    started_at      TEXT NOT NULL,
    finished_at     TEXT,
    source          TEXT NOT NULL,
    rows_inserted   INTEGER DEFAULT 0,
    notes           TEXT
);
"""

INDEX_SQL = """
CREATE INDEX IF NOT EXISTS idx_citations_issue_date ON citations(issue_date);
CREATE INDEX IF NOT EXISTS idx_citations_violation_code ON citations(violation_code);
CREATE INDEX IF NOT EXISTS idx_citations_make ON citations(make);
"""

INSERT_SQL = (
    f"INSERT OR IGNORE INTO citations ({', '.join(COLUMNS)}) "
    f"VALUES ({', '.join('?' * len(COLUMNS))})"
)


def _connect(db_path: str | Path, *, fast: bool = False) -> sqlite3.Connection:
    conn = sqlite3.connect(str(db_path))
    if fast:
        # Trade durability for speed — only safe during bulk load.
        conn.execute("PRAGMA journal_mode = OFF")
        conn.execute("PRAGMA synchronous = OFF")
        conn.execute("PRAGMA temp_store = MEMORY")
        conn.execute("PRAGMA cache_size = -200000")
    return conn


def init_db(db_path: str | Path = DB_FILENAME) -> None:
    """Create schema + indexes (idempotent)."""
    conn = _connect(db_path)
    try:
        conn.executescript(SCHEMA_SQL)
        conn.executescript(INDEX_SQL)
        conn.commit()
    finally:
        conn.close()


# ----------------------------------------------------------------------------
# CSV bulk load
# ----------------------------------------------------------------------------

def _csv_batches(csv_path: str | Path, batch_size: int) -> Iterator[pl.DataFrame]:
    reader = pl.read_csv_batched(
        str(csv_path),
        schema_overrides=POLARS_SCHEMA,
        null_values=["", "NA", "N/A"],
        ignore_errors=True,
        batch_size=batch_size,
    )
    while True:
        batches = reader.next_batches(1)
        if not batches:
            return
        yield batches[0]


def _normalize_csv_batch(df: pl.DataFrame) -> pl.DataFrame:
    return df.with_columns(
        pl.col("issue_date")
        .str.strptime(pl.Datetime, format=CSV_DATE_FORMAT, strict=False)
        .dt.strftime("%Y-%m-%dT%H:%M:%S.000")
    ).select(list(COLUMNS))


def bulk_load_csv(
    csv_path: str | Path,
    db_path: str | Path = DB_FILENAME,
    *,
    batch_size: int = 100_000,
    progress: bool = True,
) -> int:
    """Stream a Parking_Citations CSV into SQLite. Returns rows inserted."""
    init_db(db_path)
    started = time.time()
    started_iso = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(started))

    total = 0
    conn = _connect(db_path, fast=True)
    try:
        log_id = conn.execute(
            "INSERT INTO sync_log(started_at, source) VALUES(?, 'csv')",
            (started_iso,),
        ).lastrowid
        conn.commit()

        for i, batch in enumerate(_csv_batches(csv_path, batch_size), start=1):
            rows = list(_normalize_csv_batch(batch).iter_rows())
            with conn:
                conn.executemany(INSERT_SQL, rows)
            total += len(rows)
            if progress:
                elapsed = time.time() - started
                rate = total / elapsed if elapsed else 0
                print(
                    f"  batch {i}: +{len(rows):,}  total={total:,}  "
                    f"elapsed={elapsed:.1f}s  rate={rate:,.0f} rows/s",
                    flush=True,
                )

        conn.execute(
            "UPDATE sync_log SET finished_at=?, rows_inserted=? WHERE id=?",
            (time.strftime("%Y-%m-%dT%H:%M:%SZ"), total, log_id),
        )
        conn.commit()
    finally:
        conn.close()
    return total


# ----------------------------------------------------------------------------
# Socrata API sync
# ----------------------------------------------------------------------------

def _geojson_point_to_wkt(geom: dict | None) -> str | None:
    if not geom or geom.get("type") != "Point":
        return None
    coords = geom.get("coordinates") or []
    if len(coords) < 2:
        return None
    return f"POINT ({coords[0]} {coords[1]})"


def _coerce(value: Any, kind: type) -> Any:
    if value is None or value == "":
        return None
    try:
        return kind(value)
    except (TypeError, ValueError):
        return None


def _api_record_to_row(record: dict) -> tuple[Any, ...]:
    """Map a Socrata JSON record to the canonical column tuple."""
    geo = record.get("geocodelocation")
    if isinstance(geo, dict):
        geo = _geojson_point_to_wkt(geo)
    return (
        record.get("ticket_number"),
        record.get("issue_date"),
        record.get("issue_time"),
        record.get("meter_id"),
        record.get("marked_time"),
        record.get("rp_state_plate"),
        record.get("plate_expiry_date"),
        record.get("vin"),
        record.get("make"),
        record.get("body_style"),
        record.get("color"),
        record.get("location"),
        record.get("route"),
        _coerce(record.get("agency"), int),
        record.get("violation_code"),
        record.get("violation_description"),
        _coerce(record.get("fine_amount"), float),
        record.get("agency_desc"),
        record.get("color_desc"),
        record.get("body_style_desc"),
        _coerce(record.get("loc_lat"), float),
        _coerce(record.get("loc_long"), float),
        geo,
    )


def _fetch_page(
    *,
    offset: int,
    limit: int,
    app_token: str | None,
    timeout: float,
    retries: int = 3,
) -> list[dict]:
    params = {
        "$limit": limit,
        "$offset": offset,
        "$order": ":updated_at DESC",
    }
    url = f"{API_URL}?{urllib.parse.urlencode(params)}"
    req = urllib.request.Request(url)
    if app_token:
        req.add_header("X-App-Token", app_token)

    last_err: Exception | None = None
    for attempt in range(1, retries + 1):
        try:
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            # Surface Socrata's JSON error body — way more useful than a
            # bare stack trace. 4xx responses (e.g. bad token) shouldn't
            # be retried; only retry 5xx / network blips.
            body = e.read().decode("utf-8", errors="replace") if e.fp else ""
            hint = ""
            if e.code == 403 and "Invalid app_token" in body:
                hint = (
                    "\n  -> The Socrata App Token is being rejected. Verify"
                    " it at https://data.lacity.org/profile/app_tokens"
                    " (App Token, not API Key), or unset SOCRATA_APP_TOKEN"
                    " in .env to fall back to anonymous access."
                )
            msg = f"HTTP {e.code} from {API_URL}: {body.strip()}{hint}"
            if 400 <= e.code < 500:
                raise RuntimeError(msg) from e
            last_err = RuntimeError(msg)
            time.sleep(min(2 ** attempt, 10))
        except (urllib.error.URLError, TimeoutError) as e:
            last_err = e
            time.sleep(min(2 ** attempt, 10))
    assert last_err is not None
    raise last_err


def _existing_ticket_numbers(
    conn: sqlite3.Connection, ticket_numbers: list[str]
) -> set[str]:
    if not ticket_numbers:
        return set()
    placeholders = ",".join("?" * len(ticket_numbers))
    cur = conn.execute(
        f"SELECT ticket_number FROM citations WHERE ticket_number IN ({placeholders})",
        ticket_numbers,
    )
    return {row[0] for row in cur}


def update_from_api(
    db_path: str | Path = DB_FILENAME,
    *,
    app_token: str | None = None,
    page_size: int = 1000,
    max_pages: int | None = None,
    timeout: float = 60.0,
    progress: bool = True,
) -> dict[str, int]:
    """Pull newest-first from the Socrata API and insert into the DB.

    Stops as soon as any page contains a ``ticket_number`` already present
    locally — at that point the DB is considered caught up.
    Returns ``{"inserted": N, "pages": P, "caught_up": 0|1}``.

    If ``app_token`` is None, falls back to the ``SOCRATA_APP_TOKEN`` env var
    (loaded from ``.env`` at import time).
    """
    if app_token is None:
        app_token = os.getenv(APP_TOKEN_ENV) or None
        # Treat the placeholder shipped in the example .env as "no token".
        if app_token == "PASTE_YOUR_TOKEN_HERE":
            app_token = None

    init_db(db_path)
    started = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

    conn = _connect(db_path)
    inserted = 0
    pages = 0
    caught_up = False
    try:
        log_id = conn.execute(
            "INSERT INTO sync_log(started_at, source) VALUES(?, 'api')",
            (started,),
        ).lastrowid
        conn.commit()

        offset = 0
        while True:
            if max_pages is not None and pages >= max_pages:
                break

            records = _fetch_page(
                offset=offset, limit=page_size,
                app_token=app_token, timeout=timeout,
            )
            pages += 1
            if not records:
                # Reached the end of the dataset without ever matching.
                caught_up = True
                break

            ticket_numbers = [
                r["ticket_number"] for r in records if r.get("ticket_number")
            ]
            existing = _existing_ticket_numbers(conn, ticket_numbers)
            new_records = [
                r for r in records if r.get("ticket_number") not in existing
            ]
            rows = [_api_record_to_row(r) for r in new_records]
            if rows:
                with conn:
                    conn.executemany(INSERT_SQL, rows)
                inserted += len(rows)

            if progress:
                print(
                    f"  page {pages}: fetched={len(records)} "
                    f"new={len(rows)} matched={len(existing)} "
                    f"total_new={inserted}",
                    flush=True,
                )

            if existing:
                caught_up = True
                break
            offset += page_size

        conn.execute(
            "UPDATE sync_log SET finished_at=?, rows_inserted=?, notes=? WHERE id=?",
            (
                time.strftime("%Y-%m-%dT%H:%M:%SZ"),
                inserted,
                "caught_up" if caught_up else "page_limit_reached",
                log_id,
            ),
        )
        conn.commit()
    finally:
        conn.close()

    return {"inserted": inserted, "pages": pages, "caught_up": int(caught_up)}


# ----------------------------------------------------------------------------
# Stats / CLI
# ----------------------------------------------------------------------------

def db_stats(db_path: str | Path = DB_FILENAME) -> dict[str, Any]:
    conn = _connect(db_path)
    try:
        cur = conn.cursor()
        count = cur.execute("SELECT COUNT(*) FROM citations").fetchone()[0]
        max_date = cur.execute(
            "SELECT MAX(issue_date) FROM citations"
        ).fetchone()[0]
        last_sync = cur.execute(
            "SELECT source, started_at, finished_at, rows_inserted, notes "
            "FROM sync_log ORDER BY id DESC LIMIT 1"
        ).fetchone()
    finally:
        conn.close()
    return {
        "row_count": count,
        "max_issue_date": max_date,
        "last_sync": (
            None if last_sync is None
            else dict(zip(
                ("source", "started_at", "finished_at",
                 "rows_inserted", "notes"),
                last_sync,
            ))
        ),
    }


def _build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    sub = p.add_subparsers(dest="cmd", required=True)

    p_init = sub.add_parser("init", help="Create the SQLite DB schema.")
    p_init.add_argument("--db", default=DB_FILENAME)

    p_load = sub.add_parser("load-csv", help="Bulk-load CSV into SQLite.")
    p_load.add_argument("csv", help="Path to Parking_Citations CSV")
    p_load.add_argument("--db", default=DB_FILENAME)
    p_load.add_argument("--batch-size", type=int, default=100_000)

    p_sync = sub.add_parser("sync", help="Pull newest records from Socrata API.")
    p_sync.add_argument("--db", default=DB_FILENAME)
    p_sync.add_argument(
        "--app-token",
        default=None,
        help=(
            "Socrata app token (raises rate limits). Defaults to the "
            f"{APP_TOKEN_ENV} env var (auto-loaded from .env)."
        ),
    )
    p_sync.add_argument("--page-size", type=int, default=1000)
    p_sync.add_argument("--max-pages", type=int, default=None,
                        help="Cap the number of pages fetched (debug).")

    p_stats = sub.add_parser("stats", help="Show DB stats.")
    p_stats.add_argument("--db", default=DB_FILENAME)
    return p


def main(argv: list[str] | None = None) -> int:
    args = _build_parser().parse_args(argv)
    if args.cmd == "init":
        init_db(args.db)
        print(f"Initialized {args.db}")
    elif args.cmd == "load-csv":
        n = bulk_load_csv(args.csv, args.db, batch_size=args.batch_size)
        print(f"Loaded {n:,} rows into {args.db}")
    elif args.cmd == "sync":
        result = update_from_api(
            args.db,
            app_token=args.app_token,
            page_size=args.page_size,
            max_pages=args.max_pages,
        )
        print(
            f"Inserted {result['inserted']:,} new rows over {result['pages']} "
            f"pages (caught_up={bool(result['caught_up'])})"
        )
    elif args.cmd == "stats":
        print(json.dumps(db_stats(args.db), indent=2, default=str))
    return 0


if __name__ == "__main__":
    sys.exit(main())
