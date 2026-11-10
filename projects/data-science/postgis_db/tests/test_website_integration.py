"""Real PostGIS tests in a disposable schema, independent of imported CSV rows.

Run with POSTGIS_TEST_DSN set and pytest -m integration. No production tables
are modified. The isolated schema is removed after each test module.
"""

import os
from uuid import uuid4

import psycopg
from psycopg import sql
from psycopg.rows import dict_row
import pytest
from fastapi.testclient import TestClient

from api.main import app, get_query_service
from lucky_parking.models import CitationsRequest
from lucky_parking.service import QueryService

pytestmark = pytest.mark.integration

POLYGON = {"type": "Polygon", "coordinates": [[
    [-118.5, 34.0], [-118.4, 34.0], [-118.4, 34.1], [-118.5, 34.1], [-118.5, 34.0],
]]}


@pytest.fixture(scope="module")
def spatial_service():
    dsn = os.getenv("POSTGIS_TEST_DSN")
    if not dsn:
        pytest.skip("Set POSTGIS_TEST_DSN for isolated website integration tests")
    schema = "website_test_" + uuid4().hex
    with psycopg.connect(dsn, autocommit=True) as conn:
        conn.execute(sql.SQL("CREATE SCHEMA {}").format(sql.Identifier(schema)))
        conn.execute(sql.SQL("SET search_path TO {}, public").format(sql.Identifier(schema)))
        conn.execute("""
            CREATE TABLE citations (
                ticket_number text PRIMARY KEY, issue_datetime timestamptz NOT NULL,
                violation_code text, violation_description text, fine_amount double precision,
                geom geometry(Point,4326)
            );
            INSERT INTO citations VALUES
            ('a', '2025-04-26 10:00Z', 'A', 'Test', 25, ST_SetSRID(ST_Point(-118.44,34.06),4326)),
            ('b', '2025-04-26 11:00Z', 'B', 'Test', 50, ST_SetSRID(ST_Point(-118.45,34.07),4326)),
            ('c', '2025-04-26 12:00Z', 'C', 'Test', NULL, ST_SetSRID(ST_Point(-118.46,34.08),4326)),
            ('outside', '2025-04-26 12:00Z', 'D', 'Test', 100, ST_SetSRID(ST_Point(-119,34),4326)),
            ('otherdate', '2025-04-27 12:00Z', 'D', 'Test', 100, ST_SetSRID(ST_Point(-118.44,34.06),4326));
        """)
    svc = QueryService(dsn)
    svc.connect = lambda: psycopg.connect(
        dsn, row_factory=dict_row, options=f"-c search_path={schema},public -c timezone=UTC"
    )
    try:
        yield svc
    finally:
        with psycopg.connect(dsn, autocommit=True) as conn:
            conn.execute(sql.SQL("DROP SCHEMA {} CASCADE").format(sql.Identifier(schema)))


def request(**overrides):
    return CitationsRequest.model_validate({
        "date_min": "2025-04-26", "date_max": "2025-04-26",
        "geometries": [POLYGON], **overrides,
    })


def test_overlap_and_pagination_keep_complete_totals(spatial_service):
    result = spatial_service.query_citations(request(geometries=[POLYGON, POLYGON], limit=1))
    assert result["meta"] == {
        "total": 3, "total_fine": 75.0, "average_fine": 37.5,
        "returned": 1, "limit": 1, "offset": 0, "truncated": True,
        "next_offset": 1, "radius_meters": 500.0,
    }
    assert result["features"][0]["properties"]["ticket_number"] == "c"
    page2 = spatial_service.query_citations(request(limit=1, offset=1))
    assert page2["features"][0]["properties"]["ticket_number"] == "b"
    assert page2["meta"]["total"] == 3


def test_point_radius_and_empty_results(spatial_service):
    result = spatial_service.query_citations(request(
        geometries=[{"type": "Point", "coordinates": [-118.44, 34.06]}], radius_meters=100,
    ))
    assert result["meta"]["total"] == 1
    assert result["features"][0]["geometry"]["coordinates"] == [-118.44, 34.06]
    empty = spatial_service.query_citations(request(date_min="2026-01-01", date_max="2026-01-01"))
    assert empty["features"] == [] and empty["meta"]["total_fine"] == 0


def test_http_to_real_postgis(spatial_service):
    app.dependency_overrides[get_query_service] = lambda: spatial_service
    try:
        with TestClient(app) as client:
            response = client.post("/citations", json=request().model_dump(mode="json"))
            assert response.status_code == 200
            assert response.json()["meta"]["total"] == 3
            assert client.get("/ready").status_code == 200
    finally:
        app.dependency_overrides.clear()
