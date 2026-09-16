"""Region table mapping (whitelist for SQL — never take table names from users)."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Literal

from lucky_parking.models import RegionType

GeomKind = Literal["polygon", "point_radius"]


@dataclass(frozen=True, slots=True)
class RegionConfig:
    table: str
    match_column: str
    geom_kind: GeomKind
    label_column: str
    # Optional extra SQL predicate fragments (identifier-safe only).
    alt_match_column: str | None = None


REGION_CONFIG: dict[RegionType, RegionConfig] = {
    RegionType.NEIGHBORHOOD_COUNCIL: RegionConfig(
        table="neighborhood_councils",
        match_column="name",
        geom_kind="polygon",
        label_column="name",
    ),
    RegionType.NEIGHBORHOOD: RegionConfig(
        table="neighborhoods",
        match_column="name",
        geom_kind="polygon",
        label_column="name",
    ),
    RegionType.ZIP_CODE: RegionConfig(
        table="zipcodes",
        match_column="zip",
        geom_kind="polygon",
        label_column="zip",
    ),
    RegionType.CITY_COUNCIL_DISTRICT: RegionConfig(
        table="council_districts",
        match_column="district_name",
        geom_kind="polygon",
        label_column="district_name",
        alt_match_column="district",
    ),
    RegionType.PLACE_RADIUS: RegionConfig(
        table="places",
        match_column="name",
        geom_kind="point_radius",
        label_column="name",
    ),
}


def region_where_clause(config: RegionConfig) -> str:
    """SQL WHERE fragment matching a region by name (parameter ``%(region)s``)."""
    if config.alt_match_column:
        return (
            f"({config.match_column} = %(region)s "
            f"OR {config.alt_match_column}::text = %(region)s)"
        )
    return f"{config.match_column} = %(region)s"
