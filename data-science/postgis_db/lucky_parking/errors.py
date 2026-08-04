"""Errors raised by the query service (map to HTTP status in FastAPI)."""


class QueryError(Exception):
    """Base error for query failures."""


class ValidationError(QueryError):
    """Request failed business-rule validation."""


class RegionNotFoundError(QueryError):
    """Named region does not exist for the given region_type."""
