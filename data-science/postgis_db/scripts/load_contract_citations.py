#!/usr/bin/env python3
"""Build a contract-oriented ``citations`` table from the raw parking CSV.

The data contract (``datacontract.yaml``) describes query filters and chart
types, not CSV columns. This loader keeps only the citation fields needed to
satisfy that contract:

| Contract need              | Citation columns                          |
|----------------------------|-------------------------------------------|
| ``date_min`` / ``date_max``| ``issue_datetime`` (from date + time)     |
| Day of the Week chart      | ``issue_datetime``                        |
| Violation Type chart       | ``violation_code``, ``violation_description`` |
| Citation / fine totals     | row count, ``fine_amount``                |
| Density charts + regions   | ``geom`` (spatial join to boundary tables)|

Region names (``region`` / ``region_1`` / ``region_2``) come from the boundary
tables (``neighborhood_councils``, ``zipcodes``, ``council_districts``), not
the CSV. Place (Radius) still needs an external geocoder.

Example:
    python scripts/load_contract_citations.py

    # Explicit CSV path:
    python scripts/load_contract_citations.py \\
        --csv raw_data/Parking_Citations_20250811.csv

    # Smoke test on 100k rows:
    python scripts/load_contract_citations.py --limit 100000
"""
from __future__ import annotations

import argparse
import io
import os
import sys
import time
from pathlib import Path
from typing import Iterator

import polars as pl
import psycopg

ROOT = Path(__file__).resolve().parents[1]
RAW_DATA_DIR = ROOT / "raw_data"


def default_csv_path() -> Path:
    """Newest ``Parking_Citations_*.csv`` under ``raw_data/`` (matches Docker init)."""
    candidates = sorted(RAW_DATA_DIR.glob("Parking_Citations_*.csv"))
    if candidates:
        return candidates[-1]
    return RAW_DATA_DIR / "Parking_Citations_YYYYMMDD.csv"


DEFAULT_CSV = default_csv_path()
DEFAULT_DSN = os.getenv(
    "DATABASE_URL",
    "postgresql://lucky:changeme@localhost:5432/lucky_parking",
)

# Source columns required to build the contract-oriented table.
SOURCE_COLUMNS = (
    "ticket_number",
    "issue_date",
    "issue_time",
    "violation_code",
    "violation_description",
    "fine_amount",
    "loc_lat",
    "loc_long",
)

# Legacy city dumps: "2025 Apr 26 03:45:00 PM"
CSV_DATE_FORMAT_LEGACY = "%Y %b %d %I:%M:%S %p"
# data.lacity.org export (2025+): "04/26/2025 12:00:00 AM" + issue_time HHMM
CSV_DATE_FORMAT_US = "%m/%d/%Y %I:%M:%S %p"
CSV_DATE_FORMAT_US_DATE_ONLY = "%m/%d/%Y"

POLARS_SCHEMA: dict[str, pl.DataType] = {
    "ticket_number": pl.String,
    "issue_date": pl.String,
    "issue_time": pl.String,
    "violation_code": pl.String,
    "violation_description": pl.String,
    "fine_amount": pl.String,
    "loc_lat": pl.String,
    "loc_long": pl.String,
}

CREATE_STAGING_SQL = """
CREATE EXTENSION IF NOT EXISTS postgis;

DROP TABLE IF EXISTS citations_staging;
CREATE UNLOGGED TABLE citations_staging (
    ticket_number         TEXT,
    issue_datetime        TIMESTAMPTZ,
    violation_code        TEXT,
    violation_description TEXT,
    fine_amount           DOUBLE PRECISION,
    loc_lat               DOUBLE PRECISION,
    loc_long              DOUBLE PRECISION
);
"""

SWAP_SQL = """
DROP TABLE IF EXISTS citations_new;
CREATE TABLE citations_new (
    ticket_number         TEXT PRIMARY KEY,
    issue_datetime        TIMESTAMPTZ NOT NULL,
    violation_code        TEXT,
    violation_description TEXT,
    fine_amount           DOUBLE PRECISION,
    geom                  geometry(Point, 4326)
);

INSERT INTO citations_new (
    ticket_number,
    issue_datetime,
    violation_code,
    violation_description,
    fine_amount,
    geom
)
SELECT DISTINCT ON (ticket_number)
    ticket_number,
    issue_datetime,
    NULLIF(BTRIM(violation_code), ''),
    NULLIF(BTRIM(violation_description), ''),
    fine_amount,
    ST_SetSRID(ST_MakePoint(loc_long, loc_lat), 4326)
FROM citations_staging
WHERE ticket_number IS NOT NULL
  AND issue_datetime IS NOT NULL
  AND loc_lat IS NOT NULL
  AND loc_long IS NOT NULL
  AND loc_lat BETWEEN -90 AND 90
  AND loc_long BETWEEN -180 AND 180
ORDER BY ticket_number;

-- Drop the old table first so its index names are free for the new table.
DROP TABLE IF EXISTS citations;
ALTER TABLE citations_new RENAME TO citations;

CREATE INDEX idx_citations_issue_datetime ON citations (issue_datetime);
CREATE INDEX idx_citations_violation_code ON citations (violation_code);
CREATE INDEX idx_citations_geom ON citations USING GIST (geom);

DROP TABLE IF EXISTS citations_staging;

ANALYZE citations;
"""


def transform_batch(df: pl.DataFrame) -> pl.DataFrame:
    """Pare + transform one batch into staging columns (vectorized)."""
    # issue_time: strip non-digits ("1,255" -> "1255"), pad to HHMM.
    # issue_time may include commas ("1,255") or be blank; invalid → midnight.
    time_digits = (
        pl.col("issue_time")
        .cast(pl.String)
        .fill_null("")
        .str.replace_all(r"[^\d]", "")
    )
    padded = time_digits.str.zfill(4)
    hour = padded.str.slice(0, 2).cast(pl.Int32, strict=False)
    minute = padded.str.slice(2, 2).cast(pl.Int32, strict=False)
    valid_time = (
        (time_digits.str.len_chars() >= 1)
        & (time_digits.str.len_chars() <= 4)
        & hour.is_not_null()
        & minute.is_not_null()
        & hour.is_between(0, 23)
        & minute.is_between(0, 59)
    )
    # Avoid pl.time() on invalid components (Polars evaluates both branches).
    seconds = (
        pl.when(valid_time)
        .then(hour * 3600 + minute * 60)
        .otherwise(0)
        .fill_null(0)
    )

    issue_date_parsed = pl.coalesce(
        pl.col("issue_date").str.strptime(
            pl.Datetime, format=CSV_DATE_FORMAT_US, strict=False
        ),
        pl.col("issue_date").str.strptime(
            pl.Datetime, format=CSV_DATE_FORMAT_LEGACY, strict=False
        ),
        pl.col("issue_date").str.strptime(
            pl.Datetime, format=CSV_DATE_FORMAT_US_DATE_ONLY, strict=False
        ),
    )
    issue_datetime = (
        issue_date_parsed.dt.truncate("1d") + pl.duration(seconds=seconds)
    ).dt.replace_time_zone("UTC")

    fine = (
        pl.col("fine_amount")
        .cast(pl.String)
        .str.replace_all(",", "")
        .cast(pl.Float64, strict=False)
    )
    lat = pl.col("loc_lat").cast(pl.String).cast(pl.Float64, strict=False)
    lon = pl.col("loc_long").cast(pl.String).cast(pl.Float64, strict=False)

    return (
        df.with_columns(
            ticket_number=pl.col("ticket_number").cast(pl.String).str.strip_chars(),
            issue_datetime=issue_datetime,
            violation_code=pl.col("violation_code").cast(pl.String),
            violation_description=pl.col("violation_description").cast(pl.String),
            fine_amount=fine,
            loc_lat=lat,
            loc_long=lon,
        )
        .filter(pl.col("ticket_number").is_not_null() & (pl.col("ticket_number") != ""))
        .filter(pl.col("issue_datetime").is_not_null())
        .select(
            "ticket_number",
            "issue_datetime",
            "violation_code",
            "violation_description",
            "fine_amount",
            "loc_lat",
            "loc_long",
        )
    )


def iter_transformed_batches(
    csv_path: Path,
    *,
    batch_size: int,
    limit: int | None,
) -> Iterator[pl.DataFrame]:
    reader = pl.read_csv_batched(
        str(csv_path),
        columns=list(SOURCE_COLUMNS),
        schema_overrides=POLARS_SCHEMA,
        null_values=["", "NA", "N/A"],
        ignore_errors=True,
        batch_size=batch_size,
    )
    seen = 0
    while True:
        batches = reader.next_batches(1)
        if not batches:
            return
        batch = batches[0]
        if limit is not None:
            remaining = limit - seen
            if remaining <= 0:
                return
            if batch.height > remaining:
                batch = batch.head(remaining)
        transformed = transform_batch(batch)
        seen += batch.height
        if transformed.height:
            yield transformed
        if limit is not None and seen >= limit:
            return


def _copy_batch(cur: psycopg.Cursor, df: pl.DataFrame) -> int:
    # Serialize timestamps as ISO-8601 for COPY.
    out = df.with_columns(
        pl.col("issue_datetime").dt.to_string("%Y-%m-%d %H:%M:%S%z")
    )
    buf = io.StringIO()
    out.write_csv(buf, include_header=False)
    buf.seek(0)
    with cur.copy(
        """
        COPY citations_staging (
            ticket_number,
            issue_datetime,
            violation_code,
            violation_description,
            fine_amount,
            loc_lat,
            loc_long
        ) FROM STDIN WITH (FORMAT csv, NULL '')
        """
    ) as copy:
        while True:
            chunk = buf.read(1024 * 1024)
            if not chunk:
                break
            copy.write(chunk)
    return df.height


def load_citations(
    csv_path: Path,
    dsn: str,
    *,
    batch_size: int = 100_000,
    limit: int | None = None,
) -> dict[str, int | str]:
    if not csv_path.is_file():
        raise FileNotFoundError(
            f"{csv_path}\n"
            f"No citations CSV found. Add Parking_Citations_*.csv under {RAW_DATA_DIR} "
            f"or pass --csv explicitly."
        )

    started = time.time()
    loaded = 0

    with psycopg.connect(dsn) as conn:
        with conn.cursor() as cur:
            cur.execute(CREATE_STAGING_SQL)
        conn.commit()

        with conn.cursor() as cur:
            for batch in iter_transformed_batches(
                csv_path, batch_size=batch_size, limit=limit
            ):
                n = _copy_batch(cur, batch)
                loaded += n
                conn.commit()
                elapsed = time.time() - started
                rate = loaded / elapsed if elapsed else 0
                print(
                    f"  staged {loaded:,} rows ({rate:,.0f} rows/s)",
                    flush=True,
                )

        print("  swapping into citations (dedupe + geom + indexes)...", flush=True)
        with conn.cursor() as cur:
            cur.execute(
                "SELECT count(*) FILTER (WHERE issue_datetime IS NULL) FROM citations_staging"
            )
            (staging_null_dt,) = cur.fetchone()
            if loaded and staging_null_dt == loaded:
                raise RuntimeError(
                    "All staged rows have NULL issue_datetime — "
                    f"check issue_date/issue_time format in {csv_path.name}"
                )
            cur.execute(SWAP_SQL)
            cur.execute(
                """
                SELECT
                    count(*) AS total_rows,
                    count(geom) AS with_geom,
                    count(*) FILTER (WHERE geom IS NULL) AS missing_geom,
                    min(issue_datetime) AS min_dt,
                    max(issue_datetime) AS max_dt
                FROM citations
                """
            )
            total, with_geom, missing_geom, min_dt, max_dt = cur.fetchone()
        conn.commit()

    return {
        "staged_rows": loaded,
        "citations_rows": int(total),
        "with_geom": int(with_geom),
        "missing_geom": int(missing_geom),
        "min_issue_datetime": str(min_dt),
        "max_issue_datetime": str(max_dt),
        "seconds": round(time.time() - started, 1),
    }


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument(
        "--csv",
        type=Path,
        default=default_csv_path(),
        help="Path to parking citations CSV (default: newest Parking_Citations_*.csv in raw_data/)",
    )
    p.add_argument(
        "--dsn",
        default=DEFAULT_DSN,
        help="Postgres DSN (default: DATABASE_URL or local compose defaults)",
    )
    p.add_argument("--batch-size", type=int, default=100_000)
    p.add_argument(
        "--limit",
        type=int,
        default=None,
        help="Optional max source rows to read (for testing)",
    )
    return p.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    print(f"Loading {args.csv} -> {args.dsn}", flush=True)
    if args.limit:
        print(f"  limit={args.limit:,}", flush=True)
    try:
        stats = load_citations(
            args.csv,
            args.dsn,
            batch_size=args.batch_size,
            limit=args.limit,
        )
    except Exception as exc:  # noqa: BLE001 — CLI surface
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1

    print("Done.", flush=True)
    for key, value in stats.items():
        print(f"  {key}: {value}", flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
