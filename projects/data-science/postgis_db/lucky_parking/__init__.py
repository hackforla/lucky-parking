"""Lucky Parking query layer — contract models + PostGIS service (FastAPI-ready)."""

from lucky_parking.errors import QueryError, RegionNotFoundError
from lucky_parking.models import (
    ChartResult,
    ChartRow,
    ChartType,
    CompareModeRequest,
    QueryMode,
    RegionType,
    SingleDataRequest,
)

__all__ = [
    "ChartResult",
    "ChartRow",
    "ChartType",
    "CompareModeRequest",
    "QueryError",
    "QueryMode",
    "QueryService",
    "RegionNotFoundError",
    "RegionType",
    "SingleDataRequest",
]


def __getattr__(name: str):
    if name == "QueryService":
        from lucky_parking.service import QueryService

        return QueryService
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")
