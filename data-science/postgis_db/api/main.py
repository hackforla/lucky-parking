"""FastAPI app for data-contract chart queries.

Run from ``postgis_db`` (PostGIS must be up):

    uvicorn api.main:app --reload --port 8000

Every route except ``/health`` requires an ``X-API-Key`` header matching one of
the comma-separated values in ``API_KEYS``. Set ``ALLOW_UNAUTHENTICATED=1`` to
disable that check for local development only.

OpenAPI docs are served at /docs only when ``API_DOCS_PUBLIC=1``.
"""

from __future__ import annotations

import logging
import os
import sys
from collections.abc import Generator
from pathlib import Path

import psycopg
from fastapi import Depends, FastAPI, Header, HTTPException, Query, Request
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse, PlainTextResponse
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

from lucky_parking.errors import (
    ConfigurationError,
    QueryError,
    RegionNotFoundError,
    ValidationError,
)
from lucky_parking.models import (
    ChartResult,
    ChartType,
    CompareModeRequest,
    RegionType,
    SingleDataRequest,
)
from lucky_parking.ratelimit import SlidingWindowLimiter, requests_per_minute
from lucky_parking.security import (
    API_KEY_HEADER,
    allow_unauthenticated,
    api_key_fingerprint,
    api_keys,
    check_api_key,
)
from lucky_parking.service import QueryService

log = logging.getLogger("lucky_parking.api")

# Docs expose the full query surface, so they stay off unless opted in. This is
# read once at import because it is a deployment choice, not a per-request one.
_DOCS_PUBLIC = os.getenv("API_DOCS_PUBLIC", "").strip().lower() in {"1", "true", "yes", "on"}

app = FastAPI(
    title="Lucky Parking API",
    description="Query parking citation charts using the datacontract.yaml surface.",
    version="0.1.0",
    docs_url="/docs" if _DOCS_PUBLIC else None,
    redoc_url="/redoc" if _DOCS_PUBLIC else None,
    openapi_url="/openapi.json" if _DOCS_PUBLIC else None,
)

_limiter = SlidingWindowLimiter()


def get_query_service() -> Generator[QueryService, None, None]:
    yield QueryService()


def require_api_key(
    x_api_key: str | None = Header(default=None, alias=API_KEY_HEADER),
) -> str:
    """Authenticate the caller and return a log-safe identity for the request."""
    if allow_unauthenticated():
        return "unauthenticated"
    if not api_keys():
        log.error("API_KEYS is empty and ALLOW_UNAUTHENTICATED is not set; refusing all requests")
        raise HTTPException(status_code=503, detail="Server is not configured for access")
    if not check_api_key(x_api_key):
        raise HTTPException(
            status_code=401,
            detail="Missing or invalid API key",
            headers={"WWW-Authenticate": API_KEY_HEADER},
        )
    return api_key_fingerprint(x_api_key)


def enforce_rate_limit(
    request: Request,
    identity: str = Depends(require_api_key),
) -> str:
    """Throttle per API key, falling back to client IP when unauthenticated."""
    bucket = identity
    if bucket in {"unauthenticated", "anonymous"}:
        client = request.client
        bucket = f"ip:{client.host}" if client else "ip:unknown"
    retry_after = _limiter.check(bucket, max_requests=requests_per_minute())
    if retry_after is not None:
        raise HTTPException(
            status_code=429,
            detail="Rate limit exceeded",
            headers={"Retry-After": str(max(int(retry_after) + 1, 1))},
        )
    return identity


Guarded = [Depends(enforce_rate_limit)]


@app.get("/health")
def health() -> dict[str, str]:
    """Unauthenticated liveness probe — reports nothing about the data."""
    return {"status": "ok"}


@app.get("/", include_in_schema=False)
def root() -> PlainTextResponse:
    """No HTML UI here; point callers at the documented entry points."""
    hint = "See /docs" if _DOCS_PUBLIC else "See deploy docs; /docs is disabled"
    return PlainTextResponse(f"Lucky Parking API. {hint}\n")


@app.get("/chart-types", response_model=list[str], dependencies=Guarded)
def list_chart_types() -> list[str]:
    return [ct.value for ct in ChartType]


@app.get("/regions", response_model=list[str], dependencies=Guarded)
def list_regions(
    region_type: RegionType = Query(..., description="Boundary layer from the data contract"),
    limit: int = Query(500, ge=1, le=5000),
    svc: QueryService = Depends(get_query_service),
) -> list[str]:
    try:
        return svc.list_regions(region_type, limit=limit)
    except Exception as exc:  # noqa: BLE001 - classified in _sanitized_error
        raise _sanitized_error(exc) from exc


@app.post("/chart", response_model=ChartResult, dependencies=Guarded)
def chart_single(
    body: SingleDataRequest,
    svc: QueryService = Depends(get_query_service),
) -> ChartResult:
    return _run_query(svc.query_single, body)


@app.post("/chart/compare", response_model=ChartResult, dependencies=Guarded)
def chart_compare(
    body: CompareModeRequest,
    svc: QueryService = Depends(get_query_service),
) -> ChartResult:
    return _run_query(svc.query_compare, body)


def _sanitized_error(exc: Exception) -> HTTPException:
    """Log the real cause; return a response that reveals nothing about it.

    Driver messages carry the database host, user, and SQL fragments, so the
    client gets a fixed string instead. ``psycopg.Error`` is not a
    ``QueryError``, so connection and timeout failures are matched explicitly
    rather than falling through to the generic 500.
    """
    if isinstance(exc, ValidationError):
        log.warning("Query rejected: %s", exc)
        return HTTPException(status_code=422, detail=str(exc))
    log.exception("Request failed", exc_info=exc)
    if isinstance(exc, ConfigurationError):
        return HTTPException(status_code=503, detail="Server is misconfigured")
    if isinstance(exc, (psycopg.Error, QueryError)):
        return HTTPException(status_code=503, detail="Database unavailable")
    return HTTPException(status_code=500, detail="Internal server error")


def _run_query(handler, request):
    try:
        return handler(request)
    except RegionNotFoundError as exc:
        # Region names are caller-supplied, so echoing this back leaks nothing.
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except PydanticValidationError as exc:
        raise HTTPException(status_code=422, detail=exc.errors()) from exc
    except Exception as exc:  # noqa: BLE001 - classified in _sanitized_error
        raise _sanitized_error(exc) from exc


@app.exception_handler(HTTPException)
async def http_exception_handler(_, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail},
        headers=exc.headers,
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(_, exc: RequestValidationError):
    """Normalize FastAPI's own 422 body to the documented {"error": ...} shape.

    Without this, request-body validation bypasses the handler above and returns
    {"detail": [...]}, so clients would need to handle two error shapes.
    """
    return JSONResponse(status_code=422, content={"error": jsonable_encoder(exc.errors())})
