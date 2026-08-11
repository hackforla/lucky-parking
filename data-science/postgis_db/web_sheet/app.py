"""Local region/date sheet + map UI (separate from the PostGIS Docker image).

Requires PostGIS running (``docker compose up -d`` in postgis_db).

    cd postgis_db
    .venv/bin/uvicorn web_sheet.app:app --reload --port 8080

Open http://localhost:8080
"""

from __future__ import annotations

import sys
from datetime import date, datetime, timedelta
from pathlib import Path

from fastapi import FastAPI, Form, Query, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

try:
    from dotenv import load_dotenv

    load_dotenv(ROOT / ".env")
except ImportError:
    pass

from lucky_parking.errors import RegionNotFoundError
from lucky_parking.models import DEFAULT_PLACE_RADIUS_METERS, RegionType
from lucky_parking.service import QueryService

HERE = Path(__file__).resolve().parent
DEFAULT_LIMIT = 1000
REGION_TYPES = [rt.value for rt in RegionType]

app = FastAPI(title="Lucky Parking Citation Sheet", docs_url=None, redoc_url=None)
app.mount("/static", StaticFiles(directory=HERE / "static"), name="static")
templates = Jinja2Templates(directory=str(HERE / "templates"))


def _parse_date(value: str, field: str) -> date:
    try:
        return date.fromisoformat(value)
    except ValueError as exc:
        raise ValueError(f"{field} must be YYYY-MM-DD") from exc


def _base_ctx(**overrides) -> dict:
    today = date.today()
    ctx = {
        "region_types": REGION_TYPES,
        "query_mode": "single",
        "region_type": RegionType.ZIP_CODE.value,
        "region": "90024",
        "region_1": "Westwood",
        "region_2": "Hollywood",
        "date_min": date(today.year, 1, 1).isoformat(),
        "date_max": today.isoformat(),
        "limit": DEFAULT_LIMIT,
        "radius_meters": DEFAULT_PLACE_RADIUS_METERS,
        "view_mode": "chart",
        "result": None,
        "result_1": None,
        "result_2": None,
        "error": None,
    }
    ctx.update(overrides)
    return ctx


def _serialize_rows(raw_rows: list) -> list[dict]:
    rows = []
    for row in raw_rows:
        dt = row["issue_datetime"]
        rows.append(
            {
                "ticket_number": row["ticket_number"],
                "issue_datetime": dt.isoformat(sep=" ", timespec="minutes")
                if dt is not None
                else "",
                "violation_code": row["violation_code"] or "",
                "violation_description": row["violation_description"] or "",
                "fine_amount": row["fine_amount"],
                "lat": float(row["lat"]) if row.get("lat") is not None else None,
                "lon": float(row["lon"]) if row.get("lon") is not None else None,
            }
        )
    return rows


def _pack_result(raw: dict) -> dict:
    return {
        "region_type": raw["region_type"],
        "region": raw["region"],
        "total": raw["total"],
        "limit": raw["limit"],
        "truncated": raw["truncated"],
        "radius_meters": raw["radius_meters"],
        "rows": _serialize_rows(raw["rows"]),
    }


def _validate_common(
    date_min: str,
    date_max: str,
    limit: int,
    radius_meters: float,
) -> tuple[datetime, datetime]:
    d_min = _parse_date(date_min, "date_min")
    d_max = _parse_date(date_max, "date_max")
    if d_min > d_max:
        raise ValueError("date_min must be on or before date_max")
    if limit < 1 or limit > 10_000:
        raise ValueError("limit must be between 1 and 10000")
    if radius_meters <= 0 or radius_meters > 50_000:
        raise ValueError("radius_meters must be between 0 and 50000")
    start = datetime.combine(d_min, datetime.min.time())
    end = datetime.combine(d_max + timedelta(days=1), datetime.min.time())
    return start, end


@app.get("/", response_class=HTMLResponse)
async def index(request: Request) -> HTMLResponse:
    return templates.TemplateResponse(request, "index.html", _base_ctx())


@app.get("/api/regions/suggest")
async def suggest_regions(
    region_type: str = Query(...),
    q: str = Query(""),
    limit: int = Query(5, ge=1, le=20),
) -> JSONResponse:
    try:
        rt = RegionType(region_type)
    except ValueError:
        return JSONResponse({"error": f"Invalid region_type: {region_type}"}, status_code=400)
    try:
        labels = QueryService().suggest_regions(rt, q, limit=limit)
    except Exception as exc:  # noqa: BLE001
        return JSONResponse({"error": str(exc)}, status_code=503)
    return JSONResponse({"suggestions": labels})


@app.post("/lookup", response_class=HTMLResponse)
async def lookup(
    request: Request,
    query_mode: str = Form("single"),
    region_type: str = Form(...),
    date_min: str = Form(...),
    date_max: str = Form(...),
    view_mode: str = Form("chart"),
    limit: int = Form(DEFAULT_LIMIT),
    radius_meters: float = Form(DEFAULT_PLACE_RADIUS_METERS),
    region: str = Form(""),
    region_1: str = Form(""),
    region_2: str = Form(""),
) -> HTMLResponse:
    mode = query_mode if query_mode in {"single", "compare"} else "single"
    ctx = _base_ctx(
        query_mode=mode,
        region_type=region_type,
        region=region.strip(),
        region_1=region_1.strip(),
        region_2=region_2.strip(),
        date_min=date_min,
        date_max=date_max,
        limit=limit,
        radius_meters=radius_meters,
        view_mode=view_mode if view_mode in {"chart", "map"} else "chart",
    )
    try:
        rt = RegionType(region_type)
        start, end = _validate_common(date_min, date_max, limit, radius_meters)
        svc = QueryService()

        if mode == "single":
            if not region.strip():
                raise ValueError("region is required")
            raw = svc.fetch_region_citations(
                rt,
                region,
                start,
                end,
                limit=limit,
                radius_meters=radius_meters,
            )
            ctx["result"] = _pack_result(raw)
        else:
            r1 = region_1.strip()
            r2 = region_2.strip()
            if not r1 or not r2:
                raise ValueError("region_1 and region_2 are required")
            if r1.casefold() == r2.casefold():
                raise ValueError("region_1 and region_2 must differ")
            raw1 = svc.fetch_region_citations(
                rt, r1, start, end, limit=limit, radius_meters=radius_meters
            )
            raw2 = svc.fetch_region_citations(
                rt, r2, start, end, limit=limit, radius_meters=radius_meters
            )
            ctx["result_1"] = _pack_result(raw1)
            ctx["result_2"] = _pack_result(raw2)
    except (ValueError, RegionNotFoundError) as exc:
        ctx["error"] = str(exc)
    except Exception as exc:  # noqa: BLE001
        ctx["error"] = f"Query failed: {exc}"

    return templates.TemplateResponse(request, "index.html", ctx)
