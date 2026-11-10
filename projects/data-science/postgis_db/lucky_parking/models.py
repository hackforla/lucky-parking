"""Pydantic request/response models aligned with ``datacontract.yaml``."""

from __future__ import annotations

from datetime import date, datetime, timedelta
from enum import Enum
import math
from typing import Literal, Self

from pydantic import BaseModel, Field, model_validator

# Keep in sync with datacontract.yaml validValues.
DEFAULT_PLACE_RADIUS_METERS = 500


class RegionType(str, Enum):
    NEIGHBORHOOD_COUNCIL = "Neighborhood Council"
    NEIGHBORHOOD = "Neighborhood"
    ZIP_CODE = "Zip Code"
    CITY_COUNCIL_DISTRICT = "City Council District"
    PLACE_RADIUS = "Place (Radius)"


class ChartType(str, Enum):
    TOTAL_CITATIONS = "Total # Citations"
    CITATIONS_DENSITY = "Citations per Sq. Mile (Density)"
    VIOLATION_TYPE = "Violation Type"
    TOTAL_FINE = "Total $ Fine Amount"
    FINE_DENSITY = "Fine $ Amount per Sq. Mile (Density)"
    DAY_OF_WEEK = "Day of the Week"


class QueryMode(str, Enum):
    SINGLE = "single"
    COMPARE = "compare"


class _DateRangeMixin(BaseModel):
    date_min: date
    date_max: date
    chart_type: ChartType = ChartType.TOTAL_CITATIONS

    @model_validator(mode="after")
    def dates_ordered(self) -> Self:
        if self.date_min > self.date_max:
            raise ValueError("date_min must be on or before date_max")
        span = (self.date_max - self.date_min).days
        if span > 3660:
            raise ValueError("date range must not exceed 3660 days (~10 years)")
        return self

    @property
    def datetime_start(self) -> datetime:
        return datetime.combine(self.date_min, datetime.min.time())

    @property
    def datetime_end_exclusive(self) -> datetime:
        return datetime.combine(self.date_max + timedelta(days=1), datetime.min.time())


class SingleDataRequest(_DateRangeMixin):
    """Maps to datacontract schema ``single_data``."""

    region_type: RegionType
    region: str = Field(..., min_length=1, description="Region name, zip, district, or place")
    radius_meters: float = Field(
        default=DEFAULT_PLACE_RADIUS_METERS,
        gt=0,
        le=50_000,
        description="Used when region_type is Place (Radius)",
    )

    @model_validator(mode="after")
    def radius_only_for_places(self) -> Self:
        if (
            self.region_type != RegionType.PLACE_RADIUS
            and self.radius_meters != DEFAULT_PLACE_RADIUS_METERS
        ):
            raise ValueError("radius_meters applies only to Place (Radius)")
        return self


class CompareModeRequest(_DateRangeMixin):
    """Maps to datacontract schema ``compare_mode``."""

    region_type: RegionType
    region_1: str = Field(..., min_length=1)
    region_2: str = Field(..., min_length=1)
    radius_meters: float = Field(default=DEFAULT_PLACE_RADIUS_METERS, gt=0, le=50_000)

    @model_validator(mode="after")
    def regions_differ(self) -> Self:
        if self.region_1.strip().casefold() == self.region_2.strip().casefold():
            raise ValueError("region_1 and region_2 must differ")
        return self

    @model_validator(mode="after")
    def radius_only_for_places(self) -> Self:
        if (
            self.region_type != RegionType.PLACE_RADIUS
            and self.radius_meters != DEFAULT_PLACE_RADIUS_METERS
        ):
            raise ValueError("radius_meters applies only to Place (Radius)")
        return self


class ChartRow(BaseModel):
    label: str
    value: float
    count: int | None = None


class ChartResult(BaseModel):
    """Response shape for CLI / future FastAPI."""

    mode: QueryMode
    region_type: RegionType
    chart_type: ChartType
    date_min: date
    date_max: date
    region: str | None = None
    region_1: str | None = None
    region_2: str | None = None
    radius_meters: float | None = None
    rows: list[ChartRow]
    meta: dict[str, str | float | int | None] = Field(default_factory=dict)


class CitationGeometry(BaseModel):
    """A bounded GeoJSON selection from the website's geocoder."""

    type: Literal["Point", "Polygon", "MultiPolygon"]
    coordinates: list

    @model_validator(mode="after")
    def valid_coordinates(self) -> Self:
        positions = 0

        def position(value):
            nonlocal positions
            positions += 1
            if positions > 50_000:
                raise ValueError("Geometry must not exceed 50000 positions")
            if not isinstance(value, list) or len(value) != 2:
                raise ValueError("Coordinates must be [longitude, latitude] pairs")
            if any(isinstance(v, bool) or not isinstance(v, (int, float)) or not math.isfinite(v) for v in value):
                raise ValueError("Coordinates must be finite numbers")
            if not (-180 <= value[0] <= 180 and -90 <= value[1] <= 90):
                raise ValueError("Coordinates are outside longitude/latitude bounds")

        def polygon(rings):
            if not isinstance(rings, list) or not rings:
                raise ValueError("Polygon must contain at least one ring")
            for ring in rings:
                if not isinstance(ring, list) or len(ring) < 4 or ring[0] != ring[-1]:
                    raise ValueError("Polygon rings must be closed with at least four positions")
                for value in ring:
                    position(value)

        if self.type == "Point":
            position(self.coordinates)
        elif self.type == "Polygon":
            polygon(self.coordinates)
        else:
            if not self.coordinates:
                raise ValueError("MultiPolygon must contain at least one polygon")
            for rings in self.coordinates:
                polygon(rings)
        return self


class CitationsRequest(BaseModel):
    date_min: date
    date_max: date
    geometries: list[CitationGeometry] = Field(min_length=1, max_length=2)
    radius_meters: float = Field(default=DEFAULT_PLACE_RADIUS_METERS, gt=0, le=50_000)
    limit: int = Field(default=1000, ge=1, le=10_000)
    offset: int = Field(default=0, ge=0, le=1_000_000)

    @model_validator(mode="after")
    def dates_ordered(self) -> Self:
        if not 0 <= (self.date_max - self.date_min).days <= 3660:
            raise ValueError("Date range must be ordered and no longer than 3660 days")
        return self
