#!/usr/bin/env python3
"""CLI for data-contract queries against PostGIS (shared core for future FastAPI).

Examples:
    # List valid regions
    python scripts/query_contract.py list-regions --region-type "Zip Code"

    # Single-region chart
    python scripts/query_contract.py query \\
        --region-type "Zip Code" \\
        --region 90024 \\
        --date-min 2024-01-01 \\
        --date-max 2024-12-31 \\
        --chart-type "Total # Citations"

    # Compare two neighborhoods
    python scripts/query_contract.py query --compare \\
        --region-type Neighborhood \\
        --region-1 Westwood \\
        --region-2 Hollywood \\
        --date-min 2024-01-01 --date-max 2024-12-31
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

# Allow running as scripts/query_contract.py without installing the package.
ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from pydantic import ValidationError as PydanticValidationError

from lucky_parking.errors import QueryError
from lucky_parking.models import ChartType, CompareModeRequest, RegionType, SingleDataRequest
from lucky_parking.service import DEFAULT_DSN, QueryService


def _add_date_args(p: argparse.ArgumentParser) -> None:
    p.add_argument("--date-min", required=True, help="Start date (YYYY-MM-DD)")
    p.add_argument("--date-max", required=True, help="End date (YYYY-MM-DD, inclusive)")


def _build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument(
        "--dsn",
        default=DEFAULT_DSN,
        help="Postgres DSN (default: DATABASE_URL or local compose)",
    )
    sub = p.add_subparsers(dest="cmd", required=True)

    p_list = sub.add_parser("list-regions", help="List region names for a region_type")
    p_list.add_argument(
        "--region-type",
        required=True,
        choices=[rt.value for rt in RegionType],
    )
    p_list.add_argument("--limit", type=int, default=50)

    sub.add_parser("list-chart-types", help="Print chart_type enum from the contract")

    p_query = sub.add_parser("query", help="Run a contract query")
    p_query.add_argument(
        "--region-type",
        required=True,
        choices=[rt.value for rt in RegionType],
    )
    _add_date_args(p_query)
    p_query.add_argument(
        "--chart-type",
        default=ChartType.TOTAL_CITATIONS.value,
        choices=[ct.value for ct in ChartType],
    )
    p_query.add_argument(
        "--radius-meters",
        type=float,
        default=500,
        help="Buffer radius for Place (Radius) (default: 500)",
    )
    p_query.add_argument(
        "--compare",
        action="store_true",
        help="Use compare_mode (requires --region-1 and --region-2)",
    )
    p_query.add_argument("--region", help="Region name (single mode)")
    p_query.add_argument("--region-1", help="First region (compare mode)")
    p_query.add_argument("--region-2", help="Second region (compare mode)")
    return p


def _parse_date(s: str):
    from datetime import date

    return date.fromisoformat(s)


def cmd_list_regions(args: argparse.Namespace) -> int:
    svc = QueryService(args.dsn)
    regions = svc.list_regions(RegionType(args.region_type), limit=args.limit)
    for name in regions:
        print(name)
    print(f"# {len(regions)} regions", file=sys.stderr)
    return 0


def cmd_list_chart_types(_: argparse.Namespace) -> int:
    for ct in ChartType:
        print(ct.value)
    return 0


def cmd_query(args: argparse.Namespace) -> int:
    svc = QueryService(args.dsn)
    region_type = RegionType(args.region_type)
    chart_type = ChartType(args.chart_type)
    date_min = _parse_date(args.date_min)
    date_max = _parse_date(args.date_max)

    try:
        if args.compare:
            request = CompareModeRequest(
                region_type=region_type,
                region_1=args.region_1 or "",
                region_2=args.region_2 or "",
                date_min=date_min,
                date_max=date_max,
                chart_type=chart_type,
                radius_meters=args.radius_meters,
            )
            result = svc.query_compare(request)
        else:
            request = SingleDataRequest(
                region_type=region_type,
                region=args.region or "",
                date_min=date_min,
                date_max=date_max,
                chart_type=chart_type,
                radius_meters=args.radius_meters,
            )
            result = svc.query_single(request)
    except PydanticValidationError as exc:
        print(json.dumps({"error": "validation", "details": exc.errors()}, indent=2))
        return 2
    except QueryError as exc:
        print(json.dumps({"error": type(exc).__name__, "message": str(exc)}, indent=2))
        return 1

    print(result.model_dump_json(indent=2))
    return 0


def main(argv: list[str] | None = None) -> int:
    args = _build_parser().parse_args(argv)
    if args.cmd == "list-regions":
        return cmd_list_regions(args)
    if args.cmd == "list-chart-types":
        return cmd_list_chart_types(args)
    if args.cmd == "query":
        return cmd_query(args)
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
