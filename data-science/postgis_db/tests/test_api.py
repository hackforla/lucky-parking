"""FastAPI route tests (QueryService mocked — no database)."""

from datetime import date
from unittest.mock import MagicMock

import pytest
from fastapi.testclient import TestClient

from api.main import app, get_query_service
from lucky_parking.errors import RegionNotFoundError
from lucky_parking.models import (
    ChartResult,
    ChartRow,
    ChartType,
    QueryMode,
    RegionType,
)


@pytest.fixture
def mock_svc():
    svc = MagicMock()
    svc.list_regions.return_value = ["90024", "90210"]
    svc.query_single.return_value = ChartResult(
        mode=QueryMode.SINGLE,
        region_type=RegionType.ZIP_CODE,
        chart_type=ChartType.TOTAL_CITATIONS,
        date_min=date(2024, 1, 1),
        date_max=date(2024, 12, 31),
        region="90024",
        rows=[ChartRow(label="90024", value=123.0, count=123)],
        meta={"citation_rows_matched": 123},
    )
    return svc


@pytest.fixture
def client(mock_svc):
    app.dependency_overrides[get_query_service] = lambda: mock_svc
    yield TestClient(app)
    app.dependency_overrides.clear()


def test_health(client: TestClient):
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_list_chart_types(client: TestClient):
    r = client.get("/chart-types")
    assert r.status_code == 200
    assert "Total # Citations" in r.json()


def test_list_regions(client: TestClient, mock_svc: MagicMock):
    r = client.get("/regions", params={"region_type": "Zip Code", "limit": 2})
    assert r.status_code == 200
    assert r.json() == ["90024", "90210"]
    mock_svc.list_regions.assert_called_once()


def test_chart_single(client: TestClient, mock_svc: MagicMock):
    r = client.post(
        "/chart",
        json={
            "region_type": "Zip Code",
            "region": "90024",
            "date_min": "2024-01-01",
            "date_max": "2024-12-31",
            "chart_type": "Total # Citations",
        },
    )
    assert r.status_code == 200
    assert r.json()["rows"][0]["value"] == 123.0
    mock_svc.query_single.assert_called_once()


def test_chart_validation_error(client: TestClient):
    r = client.post(
        "/chart",
        json={
            "region_type": "Zip Code",
            "region": "90024",
            "date_min": "2025-01-01",
            "date_max": "2024-01-01",
        },
    )
    assert r.status_code == 422


def test_chart_region_not_found(client: TestClient, mock_svc: MagicMock):
    mock_svc.query_single.side_effect = RegionNotFoundError("No Zip Code matching '00000'")
    r = client.post(
        "/chart",
        json={
            "region_type": "Zip Code",
            "region": "00000",
            "date_min": "2024-01-01",
            "date_max": "2024-12-31",
        },
    )
    assert r.status_code == 404
