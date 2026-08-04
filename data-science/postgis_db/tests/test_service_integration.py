"""Integration tests — require PostGIS with boundaries (+ optional citations).

Run:
    cd postgis_db && pytest tests/test_service_integration.py -m integration
"""

from datetime import date

import pytest

from lucky_parking.models import ChartType, RegionType, SingleDataRequest
from lucky_parking.service import QueryService

pytestmark = pytest.mark.integration


@pytest.fixture
def svc():
    return QueryService()


def test_list_zip_codes(svc: QueryService):
    zips = svc.list_regions(RegionType.ZIP_CODE, limit=5)
    assert len(zips) >= 1


def test_query_zip_total_citations(svc: QueryService):
    zips = svc.list_regions(RegionType.ZIP_CODE, limit=1)
    if not zips:
        pytest.skip("no zipcodes loaded")
    req = SingleDataRequest(
        region_type=RegionType.ZIP_CODE,
        region=zips[0],
        date_min=date(2020, 1, 1),
        date_max=date(2020, 12, 31),
        chart_type=ChartType.TOTAL_CITATIONS,
    )
    try:
        result = svc.query_single(req)
    except Exception as exc:
        if "citations" in str(exc).lower() and "does not exist" in str(exc).lower():
            pytest.skip("citations table not loaded")
        raise
    assert result.rows
    assert result.rows[0].value >= 0
