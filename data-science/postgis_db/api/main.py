"""FastAPI skeleton for data-contract chart queries.

Run from ``postgis_db`` (PostGIS must be up):

    uvicorn api.main:app --reload --port 8000

OpenAPI docs: http://localhost:8000/docs
"""

from __future__ import annotations

import sys
from collections.abc import Generator
from pathlib import Path

from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.responses import JSONResponse, RedirectResponse
from pydantic import ValidationError as PydanticValidationError

# Ensure ``lucky_parking`` resolves when uvicorn loads ``api.main``.
ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

try:
    from dotenv import load_dotenv

    load_dotenv(ROOT / ".env")
except ImportError:
    pass

from lucky_parking.errors import QueryError, RegionNotFoundError
from lucky_parking.models import (
    ChartResult,
    ChartType,
    CompareModeRequest,
    RegionType,
    SingleDataRequest,
)
from lucky_parking.service import QueryService

app = FastAPI(
    title="Lucky Parking API",
    description="Query parking citation charts using the datacontract.yaml surface.",
    version="0.1.0",
)


def get_query_service() -> Generator[QueryService, None, None]:
    yield QueryService()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/", include_in_schema=False)
def root() -> RedirectResponse:
    """Contract API has no HTML UI — redirect browsers to OpenAPI docs."""
    return RedirectResponse(url="/docs")


@app.get("/chart-types", response_model=list[str])
def list_chart_types() -> list[str]:
    return [ct.value for ct in ChartType]


@app.get("/regions", response_model=list[str])
def list_regions(
    region_type: RegionType = Query(..., description="Boundary layer from the data contract"),
    limit: int = Query(500, ge=1, le=5000),
    svc: QueryService = Depends(get_query_service),
) -> list[str]:
    try:
        return svc.list_regions(region_type, limit=limit)
    except QueryError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@app.post("/chart", response_model=ChartResult)
def chart_single(
    body: SingleDataRequest,
    svc: QueryService = Depends(get_query_service),
) -> ChartResult:
    return _run_query(svc.query_single, body)


@app.post("/chart/compare", response_model=ChartResult)
def chart_compare(
    body: CompareModeRequest,
    svc: QueryService = Depends(get_query_service),
) -> ChartResult:
    return _run_query(svc.query_compare, body)


def _run_query(handler, request):
    try:
        return handler(request)
    except RegionNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except PydanticValidationError as exc:
        raise HTTPException(status_code=422, detail=exc.errors()) from exc
    except QueryError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@app.exception_handler(HTTPException)
async def http_exception_handler(_, exc: HTTPException):
    return JSONResponse(status_code=exc.status_code, content={"error": exc.detail})
