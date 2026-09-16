"""Credential, rate-limit, and error-sanitising tests for both apps."""

from __future__ import annotations

import base64
from unittest.mock import MagicMock

import psycopg
import pytest
from fastapi.testclient import TestClient

from api.main import app as api_app
from api.main import _limiter as api_limiter
from api.main import get_query_service
from lucky_parking.errors import ConfigurationError, QueryError
from lucky_parking.ratelimit import SlidingWindowLimiter, requests_per_minute
from lucky_parking.security import check_api_key, check_basic_auth

CHART_BODY = {
    "region_type": "Zip Code",
    "region": "90024",
    "date_min": "2024-01-01",
    "date_max": "2024-12-31",
    "chart_type": "Total # Citations",
}


@pytest.fixture
def svc():
    mock = MagicMock()
    mock.list_regions.return_value = ["90024"]
    return mock


@pytest.fixture
def client(svc: MagicMock):
    api_limiter.reset()
    api_app.dependency_overrides[get_query_service] = lambda: svc
    yield TestClient(api_app)
    api_app.dependency_overrides.clear()
    api_limiter.reset()


# --- API key handling -------------------------------------------------------


def test_health_needs_no_key(client: TestClient, monkeypatch: pytest.MonkeyPatch):
    monkeypatch.delenv("ALLOW_UNAUTHENTICATED", raising=False)
    monkeypatch.setenv("API_KEYS", "secret-key")
    assert client.get("/health").status_code == 200


def test_missing_key_is_rejected(client: TestClient, monkeypatch: pytest.MonkeyPatch):
    monkeypatch.delenv("ALLOW_UNAUTHENTICATED", raising=False)
    monkeypatch.setenv("API_KEYS", "secret-key")
    r = client.post("/chart", json=CHART_BODY)
    assert r.status_code == 401
    assert r.json() == {"error": "Missing or invalid API key"}


def test_wrong_key_is_rejected(client: TestClient, monkeypatch: pytest.MonkeyPatch):
    monkeypatch.delenv("ALLOW_UNAUTHENTICATED", raising=False)
    monkeypatch.setenv("API_KEYS", "secret-key")
    r = client.post("/chart", json=CHART_BODY, headers={"X-API-Key": "nope"})
    assert r.status_code == 401


def test_valid_key_is_accepted(
    client: TestClient, svc: MagicMock, monkeypatch: pytest.MonkeyPatch
):
    monkeypatch.delenv("ALLOW_UNAUTHENTICATED", raising=False)
    monkeypatch.setenv("API_KEYS", "first-key, second-key")
    r = client.get(
        "/regions",
        params={"region_type": "Zip Code"},
        headers={"X-API-Key": "second-key"},
    )
    assert r.status_code == 200
    svc.list_regions.assert_called_once()


def test_no_configured_keys_fails_closed(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
):
    monkeypatch.delenv("ALLOW_UNAUTHENTICATED", raising=False)
    monkeypatch.setenv("API_KEYS", "")
    r = client.post("/chart", json=CHART_BODY, headers={"X-API-Key": "anything"})
    assert r.status_code == 503


def test_non_ascii_key_does_not_crash(monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setenv("API_KEYS", "secret-key")
    assert check_api_key("ké") is False


def test_openapi_hidden_by_default(client: TestClient):
    # API_DOCS_PUBLIC is unset in tests, so the schema routes are not mounted.
    assert client.get("/openapi.json").status_code == 404
    assert client.get("/docs").status_code == 404


# --- Rate limiting ----------------------------------------------------------


def test_rate_limit_returns_429(client: TestClient, monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setenv("RATE_LIMIT_PER_MINUTE", "2")
    assert client.get("/chart-types").status_code == 200
    assert client.get("/chart-types").status_code == 200
    r = client.get("/chart-types")
    assert r.status_code == 429
    assert int(r.headers["Retry-After"]) >= 1


def test_rate_limit_disabled_by_zero(client: TestClient, monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setenv("RATE_LIMIT_PER_MINUTE", "0")
    for _ in range(10):
        assert client.get("/chart-types").status_code == 200


def test_requests_per_minute_falls_back_on_garbage(monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setenv("RATE_LIMIT_PER_MINUTE", "not-a-number")
    assert requests_per_minute(42) == 42


def test_limiter_buckets_are_independent():
    limiter = SlidingWindowLimiter()
    assert limiter.check("a", max_requests=1) is None
    assert limiter.check("b", max_requests=1) is None
    assert limiter.check("a", max_requests=1) is not None


# --- Error sanitising -------------------------------------------------------


LEAKY_MESSAGE = 'connection to server at "postgis" (172.18.0.2), user lucky failed'

# psycopg.Error is not a QueryError, so an unreachable database used to escape
# the handler entirely and return Starlette's plain-text 500. These cases use
# real driver exceptions rather than QueryError stand-ins to keep that fixed.
DB_EXCEPTIONS = [
    psycopg.OperationalError(LEAKY_MESSAGE),
    psycopg.errors.QueryCanceled("canceling statement due to statement timeout"),
    psycopg.errors.UndefinedTable('relation "citations" does not exist'),
    QueryError(LEAKY_MESSAGE),
]


@pytest.mark.parametrize("exc", DB_EXCEPTIONS, ids=lambda e: type(e).__name__)
def test_regions_database_errors_are_sanitized(
    client: TestClient, svc: MagicMock, exc: Exception
):
    svc.list_regions.side_effect = exc
    r = client.get("/regions", params={"region_type": "Zip Code"})
    assert r.status_code == 503
    assert r.json() == {"error": "Database unavailable"}
    assert "postgis" not in r.text


@pytest.mark.parametrize("exc", DB_EXCEPTIONS, ids=lambda e: type(e).__name__)
def test_chart_database_errors_are_sanitized(
    client: TestClient, svc: MagicMock, exc: Exception
):
    svc.query_single.side_effect = exc
    r = client.post("/chart", json=CHART_BODY)
    assert r.status_code == 503
    assert r.json() == {"error": "Database unavailable"}
    assert "postgis" not in r.text


def test_missing_credentials_reported_as_misconfigured(client: TestClient, svc: MagicMock):
    svc.query_single.side_effect = ConfigurationError("no DATABASE_URL")
    r = client.post("/chart", json=CHART_BODY)
    assert r.status_code == 503
    assert r.json() == {"error": "Server is misconfigured"}


def test_body_validation_uses_the_documented_error_shape(client: TestClient):
    """FastAPI's own 422 returns {"detail": [...]} unless we normalize it."""
    r = client.post("/chart", json={**CHART_BODY, "date_min": "2000-01-01"})
    assert r.status_code == 422
    assert "error" in r.json()
    assert "detail" not in r.json()


def test_unexpected_errors_return_generic_500(client: TestClient, svc: MagicMock):
    svc.query_single.side_effect = RuntimeError("/app/lucky_parking/service.py line 42")
    r = client.post("/chart", json=CHART_BODY)
    assert r.status_code == 500
    assert r.json() == {"error": "Internal server error"}


# --- Explorer UI basic auth -------------------------------------------------


def _basic_header(user: str, password: str) -> dict[str, str]:
    token = base64.b64encode(f"{user}:{password}".encode()).decode()
    return {"Authorization": f"Basic {token}"}


@pytest.fixture
def web_client():
    from web_sheet.app import _limiter as web_limiter
    from web_sheet.app import app as web_app

    web_limiter.reset()
    yield TestClient(web_app)
    web_limiter.reset()


def test_web_requires_basic_auth(web_client: TestClient, monkeypatch: pytest.MonkeyPatch):
    monkeypatch.delenv("ALLOW_UNAUTHENTICATED", raising=False)
    monkeypatch.setenv("WEB_USER", "explorer")
    monkeypatch.setenv("WEB_PASSWORD", "hunter2")
    r = web_client.get("/")
    assert r.status_code == 401
    assert r.headers["WWW-Authenticate"].startswith("Basic")


def test_web_accepts_correct_credentials(
    web_client: TestClient, monkeypatch: pytest.MonkeyPatch
):
    monkeypatch.delenv("ALLOW_UNAUTHENTICATED", raising=False)
    monkeypatch.setenv("WEB_USER", "explorer")
    monkeypatch.setenv("WEB_PASSWORD", "hunter2")
    r = web_client.get("/", headers=_basic_header("explorer", "hunter2"))
    assert r.status_code == 200


def test_web_rejects_wrong_password(
    web_client: TestClient, monkeypatch: pytest.MonkeyPatch
):
    monkeypatch.delenv("ALLOW_UNAUTHENTICATED", raising=False)
    monkeypatch.setenv("WEB_USER", "explorer")
    monkeypatch.setenv("WEB_PASSWORD", "hunter2")
    r = web_client.get("/", headers=_basic_header("explorer", "wrong"))
    assert r.status_code == 401


def test_web_static_assets_stay_public(
    web_client: TestClient, monkeypatch: pytest.MonkeyPatch
):
    monkeypatch.delenv("ALLOW_UNAUTHENTICATED", raising=False)
    monkeypatch.setenv("WEB_USER", "explorer")
    monkeypatch.setenv("WEB_PASSWORD", "hunter2")
    assert web_client.get("/static/style.css").status_code == 200


def test_web_fails_closed_without_credentials(
    web_client: TestClient, monkeypatch: pytest.MonkeyPatch
):
    monkeypatch.delenv("ALLOW_UNAUTHENTICATED", raising=False)
    r = web_client.get("/")
    assert r.status_code == 503


def test_basic_auth_rejects_empty_config(monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setenv("WEB_USER", "")
    monkeypatch.setenv("WEB_PASSWORD", "")
    assert check_basic_auth("", "") is False
