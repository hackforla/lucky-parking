#!/usr/bin/env python3
"""Probe / dry-run (and optionally apply) Socrata incremental sync against PostGIS.

Ports the untested SQLite sync algorithm from ``beta_pipeline/parking_db.py``
(``update_from_api``) onto the contract-oriented ``citations`` table used by
``postgis_db``:

1. Fetch pages from Socrata ordered by ``:updated_at DESC``.
2. Look up each page's ``ticket_number`` values in PostGIS.
3. Treat rows whose ticket is already present as "matched".
4. Stop ("caught up") as soon as any page contains a matched ticket —
   same early-exit as the SQLite sync.
5. Optionally ``INSERT … ON CONFLICT DO NOTHING`` the new rows that also
   satisfy the contract schema (valid ``issue_datetime`` + coordinates).

Default mode is **dry-run** (no writes). Use ``--apply`` to insert.

Examples:
    # Analyze only (recommended first run)
    python scripts/test_socrata_sync.py

    # Cap work while debugging
    python scripts/test_socrata_sync.py --max-pages 5 --page-size 500

    # Write a JSON report
    python scripts/test_socrata_sync.py --report dumps/socrata_sync_probe.json

    # Actually insert new contract rows
    python scripts/test_socrata_sync.py --apply

Requires ``SOCRATA_APP_TOKEN`` in ``postgis_db/.env`` (or the environment)
and a reachable PostGIS (``DATABASE_URL`` or ``POSTGRES_*``).
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib.parse import quote, urlsplit, urlunsplit

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

try:
    from dotenv import load_dotenv

    load_dotenv(ROOT / ".env")
except ImportError:
    pass

import psycopg

DATASET_ID = "4f5p-udkv"
API_URL = f"https://data.lacity.org/resource/{DATASET_ID}.json"
APP_TOKEN_ENV = "SOCRATA_APP_TOKEN"
PLACEHOLDER_TOKEN = "PASTE_YOUR_TOKEN_HERE"

INSERT_SQL = """
INSERT INTO citations (
    ticket_number,
    issue_datetime,
    violation_code,
    violation_description,
    fine_amount,
    geom
) VALUES (
    %(ticket_number)s,
    %(issue_datetime)s,
    %(violation_code)s,
    %(violation_description)s,
    %(fine_amount)s,
    ST_SetSRID(ST_MakePoint(%(lon)s, %(lat)s), 4326)
)
ON CONFLICT (ticket_number) DO NOTHING
"""


@dataclass
class PageStats:
    page: int
    offset: int
    fetched: int
    matched: int
    new_tickets: int
    insertable: int
    skipped_bad_shape: int
    min_issue_datetime: str | None
    max_issue_datetime: str | None
    sample_new_tickets: list[str] = field(default_factory=list)


@dataclass
class ProbeReport:
    mode: str
    started_at: str
    finished_at: str
    elapsed_seconds: float
    api_url: str
    order: str
    where: str | None
    page_size: int
    max_pages: int | None
    token_present: bool
    pages: int
    caught_up: bool
    stop_reason: str
    fetched_total: int
    matched_total: int
    new_ticket_total: int
    insertable_total: int
    skipped_bad_shape_total: int
    inserted_total: int
    db_before: dict[str, Any]
    db_after: dict[str, Any] | None
    pages_detail: list[PageStats]
    analysis: dict[str, Any]
    sample_insertable: list[dict[str, Any]] = field(default_factory=list)


def default_dsn() -> str:
    """Resolve DSN the same way host-side loaders do."""
    url = os.getenv("DATABASE_URL", "").strip()
    if url:
        return _rewrite_docker_hostname(url)
    password = os.getenv("POSTGRES_PASSWORD", "")
    if not password:
        raise SystemExit(
            "error: no database credentials. Set DATABASE_URL, or "
            "POSTGRES_PASSWORD (plus optional POSTGRES_USER / POSTGRES_DB / "
            "PGHOST / PGPORT)."
        )
    user = os.getenv("POSTGRES_USER", "lucky")
    database = os.getenv("POSTGRES_DB", "lucky_parking")
    host = os.getenv("PGHOST", "localhost")
    port = os.getenv("PGPORT", "5432")
    return (
        f"postgresql://{quote(user, safe='')}:{quote(password, safe='')}"
        f"@{host}:{port}/{database}"
    )


def _rewrite_docker_hostname(url: str) -> str:
    """Map compose hostname ``postgis`` → ``localhost`` when run on the host."""
    parts = urlsplit(url)
    if parts.hostname == "postgis":
        netloc = parts.netloc.replace("postgis", "localhost", 1)
        return urlunsplit((parts.scheme, netloc, parts.path, parts.query, parts.fragment))
    return url


def resolve_app_token(explicit: str | None) -> str | None:
    token = (explicit or os.getenv(APP_TOKEN_ENV) or "").strip()
    if not token or token == PLACEHOLDER_TOKEN:
        return None
    return token


def fetch_page(
    *,
    offset: int,
    limit: int,
    app_token: str | None,
    timeout: float,
    order: str = ":updated_at DESC",
    where: str | None = None,
    retries: int = 3,
) -> list[dict]:
    """Paginated Socrata fetch. Default order matches parking_db._fetch_page."""
    params: dict[str, str | int] = {
        "$limit": limit,
        "$offset": offset,
        "$order": order,
    }
    if where:
        params["$where"] = where
    url = f"{API_URL}?{urllib.parse.urlencode(params)}"
    req = urllib.request.Request(url)
    if app_token:
        req.add_header("X-App-Token", app_token)

    last_err: Exception | None = None
    for attempt in range(1, retries + 1):
        try:
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                payload = json.loads(resp.read().decode("utf-8"))
                if not isinstance(payload, list):
                    raise RuntimeError(f"Unexpected API payload type: {type(payload)}")
                return payload
        except urllib.error.HTTPError as e:
            body = e.read().decode("utf-8", errors="replace") if e.fp else ""
            hint = ""
            if e.code == 403 and "Invalid app_token" in body:
                hint = (
                    "\n  -> The Socrata App Token is being rejected. Verify"
                    " it at https://data.lacity.org/profile/app_tokens"
                    " (App Token, not API Key)."
                )
            msg = f"HTTP {e.code} from {API_URL}: {body.strip()}{hint}"
            if 400 <= e.code < 500:
                raise RuntimeError(msg) from e
            last_err = RuntimeError(msg)
            time.sleep(min(2**attempt, 10))
        except (urllib.error.URLError, TimeoutError) as e:
            last_err = e
            time.sleep(min(2**attempt, 10))
    assert last_err is not None
    raise last_err


def _coerce_float(value: Any) -> float | None:
    if value is None or value == "":
        return None
    try:
        return float(str(value).replace(",", ""))
    except (TypeError, ValueError):
        return None


def _parse_issue_datetime(issue_date: Any, issue_time: Any) -> datetime | None:
    """Build UTC issue_datetime from Socrata date + optional HHMM time."""
    if issue_date is None or issue_date == "":
        return None

    raw = str(issue_date).strip()
    base: datetime | None = None
    for fmt in (
        "%Y-%m-%dT%H:%M:%S.%f",
        "%Y-%m-%dT%H:%M:%S",
        "%Y-%m-%d",
        "%m/%d/%Y %I:%M:%S %p",
        "%m/%d/%Y",
    ):
        try:
            base = datetime.strptime(raw.replace("Z", ""), fmt)
            break
        except ValueError:
            continue
    if base is None:
        # Last resort: fromisoformat for variants with timezone offsets.
        try:
            base = datetime.fromisoformat(raw.replace("Z", "+00:00")).replace(tzinfo=None)
        except ValueError:
            return None

    hour, minute = 0, 0
    if issue_time is not None and str(issue_time).strip() != "":
        digits = re.sub(r"[^\d]", "", str(issue_time))
        if 1 <= len(digits) <= 4:
            padded = digits.zfill(4)
            h, m = int(padded[:2]), int(padded[2:])
            if 0 <= h <= 23 and 0 <= m <= 59:
                hour, minute = h, m

    return datetime(base.year, base.month, base.day, hour, minute, tzinfo=timezone.utc)


def record_to_contract_row(record: dict) -> dict[str, Any] | None:
    """Map one API record to contract insert params, or None if unusable."""
    ticket = str(record.get("ticket_number") or "").strip()
    if not ticket:
        return None
    issue_dt = _parse_issue_datetime(record.get("issue_date"), record.get("issue_time"))
    if issue_dt is None:
        return None

    lat = _coerce_float(record.get("loc_lat"))
    lon = _coerce_float(record.get("loc_long"))
    if lat is None or lon is None:
        geom = record.get("geocodelocation")
        if isinstance(geom, dict) and geom.get("type") == "Point":
            coords = geom.get("coordinates") or []
            if len(coords) >= 2:
                lon, lat = float(coords[0]), float(coords[1])
    if lat is None or lon is None:
        return None
    if not (-90 <= lat <= 90 and -180 <= lon <= 180):
        return None

    return {
        "ticket_number": ticket,
        "issue_datetime": issue_dt,
        "violation_code": (str(record["violation_code"]) if record.get("violation_code") is not None else None),
        "violation_description": (
            str(record["violation_description"])
            if record.get("violation_description") is not None
            else None
        ),
        "fine_amount": _coerce_float(record.get("fine_amount")),
        "lat": lat,
        "lon": lon,
    }


def existing_ticket_numbers(conn: psycopg.Connection, ticket_numbers: list[str]) -> set[str]:
    if not ticket_numbers:
        return set()
    with conn.cursor() as cur:
        cur.execute(
            "SELECT ticket_number FROM citations WHERE ticket_number = ANY(%s)",
            (ticket_numbers,),
        )
        return {row[0] for row in cur.fetchall()}


def db_snapshot(conn: psycopg.Connection) -> dict[str, Any]:
    with conn.cursor() as cur:
        cur.execute(
            """
            SELECT
              count(*) AS citations,
              count(*) FILTER (WHERE issue_datetime > now()) AS future_rows,
              min(issue_datetime) AS min_dt,
              max(issue_datetime) AS max_dt,
              max(issue_datetime) FILTER (WHERE issue_datetime <= now()) AS max_not_future
            FROM citations
            """
        )
        row = cur.fetchone()
        assert row is not None
        citations, future_rows, min_dt, max_dt, max_not_future = row
    return {
        "citations": int(citations),
        "future_rows": int(future_rows),
        "min_issue_datetime": min_dt.isoformat() if min_dt else None,
        "max_issue_datetime": max_dt.isoformat() if max_dt else None,
        "max_issue_datetime_not_future": (
            max_not_future.isoformat() if max_not_future else None
        ),
    }


def _dt_bounds(rows: list[dict[str, Any]]) -> tuple[str | None, str | None]:
    dts = [r["issue_datetime"] for r in rows if r.get("issue_datetime") is not None]
    if not dts:
        return None, None
    return min(dts).isoformat(), max(dts).isoformat()


def build_analysis(
    report_partial: dict[str, Any], pages: list[PageStats]
) -> dict[str, Any]:
    """Human-oriented conclusions about whether the sync algorithm behaved."""
    notes: list[str] = []
    if not report_partial["token_present"]:
        notes.append(
            "No SOCRATA_APP_TOKEN loaded - anonymous access may hit stricter rate limits."
        )

    stop = report_partial.get("stop_reason", "")
    if stop == "matched_ticket_in_page" and report_partial["pages"] == 1:
        notes.append(
            "Caught up on page 1: local DB already contains at least one ticket from "
            "the first API page (little or nothing new under this order/filter)."
        )
    elif stop == "matched_ticket_in_page":
        notes.append(
            f"Early-exit after {report_partial['pages']} page(s): first page with any "
            "locally-known ticket_number stopped the walk (SQLite sync semantics)."
        )
    elif stop == "api_exhausted":
        notes.append(
            f"Walked the full filtered result set ({report_partial['pages']} pages) "
            "until the API returned no more rows."
        )
    elif stop == "max_pages_reached":
        notes.append(
            "Hit --max-pages before catch-up or API exhaustion. "
            "Re-run with a higher --max-pages if the gap is large."
        )

    if report_partial["new_ticket_total"] and report_partial["insertable_total"] < report_partial[
        "new_ticket_total"
    ]:
        dropped = report_partial["new_ticket_total"] - report_partial["insertable_total"]
        notes.append(
            f"{dropped} new ticket(s) lack a parseable issue_datetime and/or coordinates "
            "and would be skipped by the contract loader."
        )

    if report_partial.get("stop_on_match") and report_partial["matched_total"] and report_partial[
        "new_ticket_total"
    ]:
        notes.append(
            "Caveat: early-exit on first matched ticket assumes the chosen $order is a "
            "safe watermark. With :updated_at, corrected older tickets can be missed; "
            "with issue_date DESC, future junk dates can stop the walk early."
        )

    first_match_page = next((p.page for p in pages if p.matched > 0), None)
    return {
        "first_page_with_match": first_match_page,
        "would_insert_if_applied": report_partial["insertable_total"],
        "notes": notes,
    }


def run_probe(
    *,
    dsn: str,
    app_token: str | None,
    page_size: int,
    max_pages: int | None,
    timeout: float,
    apply: bool,
    progress: bool,
    order: str = ":updated_at DESC",
    where: str | None = None,
    stop_on_match: bool = True,
) -> ProbeReport:
    started = time.time()
    started_at = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    pages_detail: list[PageStats] = []
    sample_insertable: list[dict[str, Any]] = []

    fetched_total = 0
    matched_total = 0
    new_ticket_total = 0
    insertable_total = 0
    skipped_bad_shape_total = 0
    inserted_total = 0
    pages = 0
    caught_up = False
    stop_reason = "unknown"

    with psycopg.connect(dsn) as conn:
        db_before = db_snapshot(conn)
        if progress:
            print(
                f"DB before: {db_before['citations']:,} citations; "
                f"max(not future)={db_before['max_issue_datetime_not_future']}",
                flush=True,
            )
            print(
                f"Token present: {bool(app_token)}; page_size={page_size}; "
                f"max_pages={max_pages}; order={order!r}; where={where!r}; "
                f"stop_on_match={stop_on_match}; "
                f"mode={'apply' if apply else 'dry-run'}",
                flush=True,
            )

        offset = 0
        while True:
            if max_pages is not None and pages >= max_pages:
                stop_reason = "max_pages_reached"
                break

            records = fetch_page(
                offset=offset,
                limit=page_size,
                app_token=app_token,
                timeout=timeout,
                order=order,
                where=where,
            )
            pages += 1
            if not records:
                caught_up = True
                stop_reason = "api_exhausted"
                break

            ticket_numbers = [
                str(r["ticket_number"]).strip()
                for r in records
                if r.get("ticket_number")
            ]
            existing = existing_ticket_numbers(conn, ticket_numbers)
            new_records = [
                r
                for r in records
                if str(r.get("ticket_number") or "").strip() not in existing
            ]

            insertable_rows: list[dict[str, Any]] = []
            skipped = 0
            for rec in new_records:
                row = record_to_contract_row(rec)
                if row is None:
                    skipped += 1
                else:
                    insertable_rows.append(row)

            if len(sample_insertable) < 10:
                for row in insertable_rows:
                    if len(sample_insertable) >= 10:
                        break
                    sample_insertable.append(
                        {
                            "ticket_number": row["ticket_number"],
                            "issue_datetime": row["issue_datetime"].isoformat(),
                            "violation_code": row["violation_code"],
                            "fine_amount": row["fine_amount"],
                            "lat": row["lat"],
                            "lon": row["lon"],
                        }
                    )

            applied = 0
            if apply and insertable_rows:
                with conn.cursor() as cur:
                    cur.executemany(INSERT_SQL, insertable_rows)
                conn.commit()
                applied = len(insertable_rows)
                inserted_total += applied

            min_dt, max_dt = _dt_bounds(insertable_rows)
            page_stats = PageStats(
                page=pages,
                offset=offset,
                fetched=len(records),
                matched=len(existing),
                new_tickets=len(new_records),
                insertable=len(insertable_rows),
                skipped_bad_shape=skipped,
                min_issue_datetime=min_dt,
                max_issue_datetime=max_dt,
                sample_new_tickets=[
                    str(r.get("ticket_number"))
                    for r in new_records[:5]
                    if r.get("ticket_number")
                ],
            )
            pages_detail.append(page_stats)

            fetched_total += len(records)
            matched_total += len(existing)
            new_ticket_total += len(new_records)
            insertable_total += len(insertable_rows)
            skipped_bad_shape_total += skipped

            if progress:
                print(
                    f"  page {pages}: fetched={len(records)} new={len(new_records)} "
                    f"matched={len(existing)} insertable={len(insertable_rows)} "
                    f"skipped_shape={skipped}"
                    + (f" inserted={applied}" if apply else ""),
                    flush=True,
                )

            if existing and stop_on_match:
                caught_up = True
                stop_reason = "matched_ticket_in_page"
                break
            offset += page_size

        db_after = db_snapshot(conn) if apply else None

    finished_at = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    elapsed = time.time() - started
    partial = {
        "token_present": bool(app_token),
        "caught_up": caught_up,
        "pages": pages,
        "new_ticket_total": new_ticket_total,
        "insertable_total": insertable_total,
        "matched_total": matched_total,
        "stop_reason": stop_reason,
        "stop_on_match": stop_on_match,
    }
    analysis = build_analysis(partial, pages_detail)
    analysis["order"] = order
    analysis["where"] = where
    analysis["stop_on_match"] = stop_on_match
    analysis["algorithm"] = (
        f"order by {order}"
        + (f"; where {where}" if where else "")
        + (
            "; stop when any ticket_number in page exists locally"
            if stop_on_match
            else "; walk all pages (no early exit)"
        )
    )

    return ProbeReport(
        mode="apply" if apply else "dry-run",
        started_at=started_at,
        finished_at=finished_at,
        elapsed_seconds=round(elapsed, 2),
        api_url=API_URL,
        order=order,
        where=where,
        page_size=page_size,
        max_pages=max_pages,
        token_present=bool(app_token),
        pages=pages,
        caught_up=caught_up,
        stop_reason=stop_reason,
        fetched_total=fetched_total,
        matched_total=matched_total,
        new_ticket_total=new_ticket_total,
        insertable_total=insertable_total,
        skipped_bad_shape_total=skipped_bad_shape_total,
        inserted_total=inserted_total,
        db_before=db_before,
        db_after=db_after,
        pages_detail=pages_detail,
        analysis=analysis,
        sample_insertable=sample_insertable,
    )


def print_summary(report: ProbeReport) -> None:
    print()
    print("== Socrata sync probe ==")
    print(f"  mode:              {report.mode}")
    print(f"  order:             {report.order}")
    print(f"  where:             {report.where or '(none)'}")
    print(f"  elapsed:           {report.elapsed_seconds}s")
    print(f"  pages:             {report.pages}")
    print(f"  caught_up:         {report.caught_up} ({report.stop_reason})")
    print(f"  fetched:           {report.fetched_total}")
    print(f"  matched existing:  {report.matched_total}")
    print(f"  new tickets:       {report.new_ticket_total}")
    print(f"  insertable:        {report.insertable_total}")
    print(f"  skipped (shape):   {report.skipped_bad_shape_total}")
    print(f"  inserted:          {report.inserted_total}")
    print(
        f"  DB before max:     {report.db_before.get('max_issue_datetime_not_future')}"
    )
    if report.db_after:
        print(
            f"  DB after max:      {report.db_after.get('max_issue_datetime_not_future')}"
        )
        print(
            f"  DB row delta:      "
            f"{report.db_after['citations'] - report.db_before['citations']:+,}"
        )
    print("  analysis notes:")
    for note in report.analysis.get("notes", []):
        print(f"    - {note}")
    if report.sample_insertable:
        print("  sample insertable (up to 10):")
        for row in report.sample_insertable:
            print(
                f"    {row['ticket_number']}  {row['issue_datetime']}  "
                f"{row.get('violation_code') or '-'}"
            )


def _build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(
        description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    p.add_argument("--dsn", default=None, help="Postgres DSN (default: from .env)")
    p.add_argument(
        "--app-token",
        default=None,
        help=f"Override {APP_TOKEN_ENV} (prefer setting the env var instead)",
    )
    p.add_argument("--page-size", type=int, default=1000)
    p.add_argument(
        "--order",
        default=":updated_at DESC",
        help=(
            "Socrata $order clause. Default matches beta_pipeline SQLite sync. "
            "Try 'issue_date DESC' to measure gap-fill after a stale CSV load."
        ),
    )
    p.add_argument(
        "--where",
        default=None,
        help=(
            "Optional Socrata $where clause, e.g. "
            "\"issue_date > '2026-07-31T00:00:00.000'\""
        ),
    )
    p.add_argument(
        "--since-db-max",
        action="store_true",
        help=(
            "Set $where to issue_date greater than the DB's max non-future "
            "issue_datetime (gap-fill mode)."
        ),
    )
    p.add_argument(
        "--no-stop-on-match",
        action="store_true",
        help="Disable early-exit; walk until --max-pages or API exhaustion.",
    )
    p.add_argument(
        "--max-pages",
        type=int,
        default=None,
        help="Safety cap on pages fetched (omit for full catch-up walk)",
    )
    p.add_argument("--timeout", type=float, default=60.0)
    p.add_argument(
        "--apply",
        action="store_true",
        help="Insert insertable new rows into PostGIS (default: dry-run)",
    )
    p.add_argument(
        "--report",
        type=Path,
        default=None,
        help="Write full JSON report to this path",
    )
    p.add_argument("--quiet", action="store_true", help="Suppress per-page progress")
    return p


def main(argv: list[str] | None = None) -> int:
    args = _build_parser().parse_args(argv)
    token = resolve_app_token(args.app_token)
    dsn = args.dsn or default_dsn()

    where = args.where
    if args.since_db_max:
        with psycopg.connect(dsn) as conn:
            snap = db_snapshot(conn)
        max_nf = snap.get("max_issue_datetime_not_future")
        if not max_nf:
            raise SystemExit("error: --since-db-max needs a non-future max datetime in DB")
        # Socrata floating timestamps: open interval after local max date,
        # capped at "today" so future junk issue_dates are excluded.
        day = max_nf[:10]
        today = time.strftime("%Y-%m-%d", time.gmtime())
        where = (
            f"issue_date > '{day}T00:00:00.000' "
            f"AND issue_date < '{today}T23:59:59.999'"
        )
        print(f"Using --since-db-max where: {where}", flush=True)

    report = run_probe(
        dsn=dsn,
        app_token=token,
        page_size=args.page_size,
        max_pages=args.max_pages,
        timeout=args.timeout,
        apply=args.apply,
        progress=not args.quiet,
        order=args.order,
        where=where,
        stop_on_match=not args.no_stop_on_match,
    )
    print_summary(report)

    if args.report:
        args.report.parent.mkdir(parents=True, exist_ok=True)
        payload = asdict(report)
        args.report.write_text(json.dumps(payload, indent=2, default=str) + "\n", encoding="utf-8")
        print(f"\nWrote report: {args.report}")

    # Non-zero if the API walk failed to catch up when no max_pages was set.
    if not report.caught_up and args.max_pages is None:
        return 2
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
