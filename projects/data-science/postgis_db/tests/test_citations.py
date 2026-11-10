"""Website API contract and selection validation (no database required)."""

from unittest.mock import MagicMock

from fastapi.testclient import TestClient
import pytest
from pydantic import ValidationError

from api.main import app, get_query_service
from lucky_parking.models import CitationGeometry, CitationsRequest


def payload(**overrides):
    return {
        "date_min": "2025-04-26", "date_max": "2025-04-26",
        "geometries": [{"type": "Point", "coordinates": [-118.44, 34.06]}],
        **overrides,
    }


@pytest.mark.parametrize("geometry", [
    {"type": "Point", "coordinates": [181, 34]},
    {"type": "Point", "coordinates": [True, 34]},
    {"type": "Point", "coordinates": [float("nan"), 34]},
    {"type": "Polygon", "coordinates": [[[0, 0], [1, 0], [1, 1], [0, 1]]]},
    {"type": "MultiPolygon", "coordinates": []},
])
def test_invalid_geometry_is_rejected(geometry):
    with pytest.raises(ValidationError):
        CitationGeometry.model_validate(geometry)


@pytest.mark.parametrize("overrides", [
    {"limit": 10001}, {"offset": -1}, {"geometries": []},
    {"date_max": "2025-04-25"}, {"date_min": "2000-01-01"},
])
def test_unbounded_or_invalid_query_is_rejected(overrides):
    with pytest.raises(ValidationError):
        CitationsRequest.model_validate(payload(**overrides))


def test_website_route_forwards_validated_selection():
    svc = MagicMock()
    svc.query_citations.return_value = {
        "type": "FeatureCollection", "features": [],
        "meta": {"total": 3, "total_fine": 75, "returned": 0},
    }
    app.dependency_overrides[get_query_service] = lambda: svc
    try:
        with TestClient(app) as client:
            response = client.post("/citations", json=payload(limit=1, offset=2))
        assert response.status_code == 200
        assert response.json()["meta"]["total"] == 3
        request = svc.query_citations.call_args.args[0]
        assert request.limit == 1 and request.offset == 2
        assert request.geometries[0].type == "Point"
    finally:
        app.dependency_overrides.clear()


def test_website_route_requires_api_key_when_enabled(monkeypatch):
    monkeypatch.setenv("ALLOW_UNAUTHENTICATED", "0")
    monkeypatch.setenv("API_KEYS", "test-key")
    with TestClient(app) as client:
        response = client.post("/citations", json=payload())
    assert response.status_code == 401
