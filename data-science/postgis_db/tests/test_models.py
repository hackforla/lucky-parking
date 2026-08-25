"""Tests for contract request validation (no database required)."""

from datetime import date

import pytest
from pydantic import ValidationError

from lucky_parking.models import (
    ChartType,
    CompareModeRequest,
    RegionType,
    SingleDataRequest,
)


def test_single_valid_request():
    req = SingleDataRequest(
        region_type=RegionType.ZIP_CODE,
        region="90024",
        date_min=date(2024, 1, 1),
        date_max=date(2024, 12, 31),
        chart_type=ChartType.TOTAL_CITATIONS,
    )
    assert req.region == "90024"


def test_date_min_after_max_rejected():
    with pytest.raises(ValidationError):
        SingleDataRequest(
            region_type=RegionType.ZIP_CODE,
            region="90024",
            date_min=date(2025, 1, 1),
            date_max=date(2024, 1, 1),
        )


def test_compare_regions_must_differ():
    with pytest.raises(ValidationError):
        CompareModeRequest(
            region_type=RegionType.NEIGHBORHOOD,
            region_1="Westwood",
            region_2="westwood",
            date_min=date(2024, 1, 1),
            date_max=date(2024, 6, 1),
        )


def test_radius_only_for_place():
    with pytest.raises(ValidationError):
        SingleDataRequest(
            region_type=RegionType.ZIP_CODE,
            region="90024",
            date_min=date(2024, 1, 1),
            date_max=date(2024, 6, 1),
            radius_meters=1000,
        )


def test_place_radius_allows_custom_radius():
    req = SingleDataRequest(
        region_type=RegionType.PLACE_RADIUS,
        region="Griffith Observatory",
        date_min=date(2024, 1, 1),
        date_max=date(2024, 6, 1),
        radius_meters=750,
    )
    assert req.radius_meters == 750
