"""Orchestrate PostGIS load → clean pipeline.

After the raw ``citations`` table is updated from the city CSV, rebuild the
cleaned ``citations_clean`` table, then drop rows missing datetime or loc_lat.

CLI:
    python parking_pipeline.py run Parking_Citations_20250811.csv
    python parking_pipeline.py clean          # skip load, rebuild clean only
"""
from __future__ import annotations

import argparse
import json
import sys

from parking_clean import clean_stats, drop_incomplete, rebuild_clean
from parking_postgis import bulk_load_csv, database_url, db_stats


def run_pipeline(
    csv_path: str | None = None,
    dsn: str | None = None,
    *,
    batch_size: int = 100_000,
    skip_load: bool = False,
    progress: bool = True,
) -> dict[str, object]:
    """Load raw citations (optional), rebuild clean datetimes, drop incomplete."""
    if not skip_load:
        if not csv_path:
            raise ValueError("csv_path is required unless skip_load=True")
        bulk_load_csv(csv_path, dsn, batch_size=batch_size, progress=progress)
    # 1) Combined issue_datetime from issue_date + issue_time
    rebuild_clean(dsn, progress=progress)
    # 2) Require both datetime and loc_lat
    dropped = drop_incomplete(dsn, progress=progress)
    return {
        "database_url": database_url(dsn),
        "raw": db_stats(dsn),
        "clean": clean_stats(dsn),
        "dropped_incomplete": dropped,
    }


def _build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    p.add_argument(
        "--database-url",
        default=None,
        help="Postgres DSN (default: DATABASE_URL env or docker default)",
    )
    p.add_argument(
        "--batch-size",
        type=int,
        default=100_000,
        help="CSV batch size for load-csv (run subcommand only)",
    )
    sub = p.add_subparsers(dest="cmd", required=True)

    p_run = sub.add_parser(
        "run",
        help="Bulk-load CSV into citations, then rebuild citations_clean.",
    )
    p_run.add_argument("csv", help="Path to Parking_Citations CSV")

    sub.add_parser(
        "clean",
        help="Rebuild citations_clean from existing citations (no CSV load).",
    )
    return p


def main(argv: list[str] | None = None) -> int:
    args = _build_parser().parse_args(argv)
    dsn = args.database_url
    if args.cmd == "run":
        summary = run_pipeline(args.csv, dsn, batch_size=args.batch_size)
    else:
        summary = run_pipeline(dsn=dsn, skip_load=True)
    print(json.dumps(summary, indent=2, default=str))
    return 0


if __name__ == "__main__":
    sys.exit(main())
