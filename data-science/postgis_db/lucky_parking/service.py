"""PostGIS query execution for data-contract chart requests."""

from __future__ import annotations

import os
from typing import Any

import psycopg
from psycopg.rows import dict_row

from lucky_parking.errors import RegionNotFoundError
from lucky_parking.models import (
    ChartResult,
    ChartRow,
    ChartType,
    CompareModeRequest,
    QueryMode,
    RegionType,
    SingleDataRequest,
)
from lucky_parking.regions import REGION_CONFIG, RegionConfig, region_where_clause

DEFAULT_DSN = os.getenv(
    "DATABASE_URL",
    "postgresql://lucky:changeme@localhost:5432/lucky_parking",
)

SQ_MI = 2589988.110336  # sq meters per sq mile


def _spatial_predicate(config: RegionConfig) -> str:
    if config.geom_kind == "polygon":
        return "ST_Contains(r.geom, c.geom)"
    return "ST_DWithin(c.geom::geography, r.geom::geography, %(radius_meters)s)"


def _area_sq_mi_expr(config: RegionConfig) -> str:
    if config.geom_kind == "polygon":
        return f"GREATEST(ST_Area(r.geom::geography) / {SQ_MI}, 1e-9)"
    return "GREATEST(pi() * POWER(%(radius_meters)s / 1609.344, 2), 1e-9)"


def _build_region_cte(config: RegionConfig) -> str:
    where = region_where_clause(config)
    return f"""
    region AS (
        SELECT
            {config.label_column} AS region_label,
            geom
        FROM {config.table}
        WHERE {where}
        LIMIT 1
    )
    """


def _fix_scalar_query(config: RegionConfig, chart_type: ChartType) -> str:
    """Build scalar aggregate query (non-grouped charts)."""
    area_expr = _area_sq_mi_expr(config)
    spatial = _spatial_predicate(config)

    if chart_type == ChartType.TOTAL_CITATIONS:
        metric = "count(*)::float"
        count_expr = "count(*)::int"
    elif chart_type == ChartType.CITATIONS_DENSITY:
        metric = f"(count(*)::float / {area_expr})"
        count_expr = "count(*)::int"
    elif chart_type == ChartType.TOTAL_FINE:
        metric = "coalesce(sum(c.fine_amount), 0)::float"
        count_expr = "count(*)::int"
    elif chart_type == ChartType.FINE_DENSITY:
        metric = f"(coalesce(sum(c.fine_amount), 0)::float / {area_expr})"
        count_expr = "count(*)::int"
    else:
        raise ValueError(chart_type)

    return f"""
    WITH {_build_region_cte(config)}
    SELECT
        (SELECT region_label FROM region LIMIT 1) AS label,
        {metric} AS value,
        {count_expr} AS count
    FROM citations c
    INNER JOIN region r ON TRUE
    WHERE c.geom IS NOT NULL
      AND c.issue_datetime >= %(date_min)s
      AND c.issue_datetime < %(date_max)s
      AND {spatial}
    """


def _build_grouped_query(config: RegionConfig, chart_type: ChartType) -> str:
    spatial = _spatial_predicate(config)

    if chart_type == ChartType.VIOLATION_TYPE:
        return f"""
        WITH {_build_region_cte(config)}
        SELECT
            coalesce(c.violation_description, c.violation_code, 'Unknown') AS label,
            count(*)::float AS value,
            count(*)::int AS count
        FROM citations c
        INNER JOIN region r ON TRUE
        WHERE c.geom IS NOT NULL
          AND c.issue_datetime >= %(date_min)s
          AND c.issue_datetime < %(date_max)s
          AND {spatial}
        GROUP BY 1
        ORDER BY value DESC, label
        LIMIT 50
        """

    if chart_type == ChartType.DAY_OF_WEEK:
        return f"""
        WITH {_build_region_cte(config)},
        agg AS (
            SELECT
                extract(dow from c.issue_datetime AT TIME ZONE 'America/Los_Angeles')::int AS dow,
                count(*)::float AS value,
                count(*)::int AS count
            FROM citations c
            INNER JOIN region r ON TRUE
            WHERE c.geom IS NOT NULL
              AND c.issue_datetime >= %(date_min)s
              AND c.issue_datetime < %(date_max)s
              AND {spatial}
            GROUP BY 1
        )
        SELECT
            CASE dow
                WHEN 0 THEN 'Sunday'
                WHEN 1 THEN 'Monday'
                WHEN 2 THEN 'Tuesday'
                WHEN 3 THEN 'Wednesday'
                WHEN 4 THEN 'Thursday'
                WHEN 5 THEN 'Friday'
                WHEN 6 THEN 'Saturday'
            END AS label,
            value,
            count
        FROM agg
        ORDER BY dow
        """

    raise ValueError(chart_type)


def build_chart_sql(config: RegionConfig, chart_type: ChartType) -> str:
    if chart_type in (ChartType.VIOLATION_TYPE, ChartType.DAY_OF_WEEK):
        return _build_grouped_query(config, chart_type)
    return _fix_scalar_query(config, chart_type)


class QueryService:
    """Contract query executor — inject into FastAPI routes later."""

    def __init__(self, dsn: str | None = None) -> None:
        self.dsn = dsn or DEFAULT_DSN

    def connect(self) -> psycopg.Connection:
        return psycopg.connect(self.dsn, row_factory=dict_row)

    def list_regions(self, region_type: RegionType, *, limit: int = 500) -> list[str]:
        config = REGION_CONFIG[region_type]
        sql = f"""
        SELECT DISTINCT {config.label_column} AS label
        FROM {config.table}
        ORDER BY 1
        LIMIT %(limit)s
        """
        with self.connect() as conn:
            with conn.cursor() as cur:
                cur.execute(sql, {"limit": limit})
                return [str(row["label"]) for row in cur.fetchall()]

    def suggest_regions(
        self,
        region_type: RegionType,
        query: str,
        *,
        limit: int = 5,
    ) -> list[str]:
        """Return up to ``limit`` region labels matching live typing (alphabetical)."""
        config = REGION_CONFIG[region_type]
        q = query.strip()
        params: dict[str, Any] = {"limit": limit}
        if q:
            # Prefix match preferred; fall back to contains if needed via OR.
            params["prefix"] = f"{q}%"
            params["contains"] = f"%{q}%"
            where = (
                f"({config.label_column} ILIKE %(prefix)s "
                f"OR {config.label_column} ILIKE %(contains)s)"
            )
            if config.alt_match_column:
                where = (
                    f"({where} OR {config.alt_match_column}::text ILIKE %(prefix)s "
                    f"OR {config.alt_match_column}::text ILIKE %(contains)s)"
                )
        else:
            where = "TRUE"

        sql = f"""
        SELECT DISTINCT {config.label_column} AS label
        FROM {config.table}
        WHERE {where}
        ORDER BY 1
        LIMIT %(limit)s
        """
        with self.connect() as conn:
            with conn.cursor() as cur:
                cur.execute(sql, params)
                return [str(row["label"]) for row in cur.fetchall()]

    def fetch_region_citations(
        self,
        region_type: RegionType,
        region: str,
        date_min,
        date_max,
        *,
        limit: int = 1000,
        radius_meters: float = 500.0,
    ) -> dict[str, Any]:
        """Return citation rows for a contract region + date range (sheet/map UI).

        Includes lon/lat from ``geom`` for map markers. Results capped at ``limit``.
        """
        config = REGION_CONFIG[region_type]
        region = region.strip()
        params: dict[str, Any] = {
            "region": region,
            "date_min": date_min,
            "date_max": date_max,
            "limit": limit,
            "radius_meters": radius_meters,
        }

        if config.geom_kind == "polygon":
            spatial = "ST_Contains(r.geom, c.geom)"
        else:
            spatial = (
                "ST_DWithin(c.geom::geography, r.geom::geography, %(radius_meters)s)"
            )

        with self.connect() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    f"""
                    SELECT 1 FROM {config.table}
                    WHERE {region_where_clause(config)}
                    LIMIT 1
                    """,
                    {"region": region},
                )
                if cur.fetchone() is None:
                    raise RegionNotFoundError(
                        f"No {region_type.value} matching {region!r}"
                    )

                cur.execute(
                    f"""
                    WITH region AS (
                        SELECT geom
                        FROM {config.table}
                        WHERE {region_where_clause(config)}
                        LIMIT 1
                    )
                    SELECT count(*)::int AS total
                    FROM citations c
                    INNER JOIN region r ON TRUE
                    WHERE c.geom IS NOT NULL
                      AND c.issue_datetime >= %(date_min)s
                      AND c.issue_datetime < %(date_max)s
                      AND {spatial}
                    """,
                    params,
                )
                total = int(cur.fetchone()["total"])

                cur.execute(
                    f"""
                    WITH region AS (
                        SELECT geom
                        FROM {config.table}
                        WHERE {region_where_clause(config)}
                        LIMIT 1
                    )
                    SELECT
                        c.ticket_number,
                        c.issue_datetime,
                        c.violation_code,
                        c.violation_description,
                        c.fine_amount,
                        ST_Y(c.geom::geometry) AS lat,
                        ST_X(c.geom::geometry) AS lon
                    FROM citations c
                    INNER JOIN region r ON TRUE
                    WHERE c.geom IS NOT NULL
                      AND c.issue_datetime >= %(date_min)s
                      AND c.issue_datetime < %(date_max)s
                      AND {spatial}
                    ORDER BY c.issue_datetime DESC, c.ticket_number
                    LIMIT %(limit)s
                    """,
                    params,
                )
                rows = cur.fetchall()

        return {
            "region_type": region_type.value,
            "region": region,
            "total": total,
            "limit": limit,
            "truncated": total > limit,
            "radius_meters": radius_meters
            if region_type == RegionType.PLACE_RADIUS
            else None,
            "rows": rows,
        }

    def fetch_zip_citations(
        self,
        zip_code: str,
        date_min,
        date_max,
        *,
        limit: int = 1000,
    ) -> dict[str, Any]:
        """Backward-compatible wrapper around ``fetch_region_citations``."""
        result = self.fetch_region_citations(
            RegionType.ZIP_CODE,
            zip_code,
            date_min,
            date_max,
            limit=limit,
        )
        result["zip"] = result["region"]
        return result

    def _params_base(
        self,
        region: str,
        date_min,
        date_max,
        radius_meters: float,
    ) -> dict[str, Any]:
        return {
            "region": region.strip(),
            "date_min": date_min,
            "date_max": date_max,
            "radius_meters": radius_meters,
        }

    def _run_chart(
        self,
        region_type: RegionType,
        region: str,
        chart_type: ChartType,
        date_min,
        date_max,
        radius_meters: float,
    ) -> tuple[list[ChartRow], dict[str, Any]]:
        config = REGION_CONFIG[region_type]
        sql = build_chart_sql(config, chart_type)
        params = self._params_base(region, date_min, date_max, radius_meters)

        with self.connect() as conn:
            with conn.cursor() as cur:
                check_sql = f"""
                SELECT 1 FROM {config.table}
                WHERE {region_where_clause(config)}
                LIMIT 1
                """
                cur.execute(check_sql, {"region": params["region"]})
                if cur.fetchone() is None:
                    raise RegionNotFoundError(
                        f"No {region_type.value} matching {region!r}"
                    )

                cur.execute(sql, params)
                rows = cur.fetchall()

        chart_rows = [
            ChartRow(
                label=str(r["label"]),
                value=float(r["value"]),
                count=int(r["count"]) if r.get("count") is not None else None,
            )
            for r in rows
        ]
        meta: dict[str, Any] = {
            "citation_rows_matched": sum(r.count or 0 for r in chart_rows)
        }
        if chart_type in (ChartType.CITATIONS_DENSITY, ChartType.FINE_DENSITY):
            meta["area_sq_mi_note"] = (
                "Density uses region polygon area or circular place buffer."
            )
        return chart_rows, meta

    def query_single(self, request: SingleDataRequest) -> ChartResult:
        rows, meta = self._run_chart(
            request.region_type,
            request.region,
            request.chart_type,
            request.datetime_start,
            request.datetime_end_exclusive,
            request.radius_meters,
        )
        return ChartResult(
            mode=QueryMode.SINGLE,
            region_type=request.region_type,
            chart_type=request.chart_type,
            date_min=request.date_min,
            date_max=request.date_max,
            region=request.region,
            radius_meters=(
                request.radius_meters
                if request.region_type == RegionType.PLACE_RADIUS
                else None
            ),
            rows=rows,
            meta=meta,
        )

    def query_compare(self, request: CompareModeRequest) -> ChartResult:
        rows: list[ChartRow] = []
        meta: dict[str, Any] = {}

        for key, region in (("region_1", request.region_1), ("region_2", request.region_2)):
            part, part_meta = self._run_chart(
                request.region_type,
                region,
                request.chart_type,
                request.datetime_start,
                request.datetime_end_exclusive,
                request.radius_meters,
            )
            if request.chart_type in (ChartType.VIOLATION_TYPE, ChartType.DAY_OF_WEEK):
                for row in part:
                    rows.append(
                        ChartRow(
                            label=f"{region} — {row.label}",
                            value=row.value,
                            count=row.count,
                        )
                    )
            else:
                label = part[0].label if part else region
                value = part[0].value if part else 0.0
                count = part[0].count if part else 0
                rows.append(ChartRow(label=f"{key}: {label}", value=value, count=count))
            meta[f"{key}_matched"] = part_meta.get("citation_rows_matched", 0)

        return ChartResult(
            mode=QueryMode.COMPARE,
            region_type=request.region_type,
            chart_type=request.chart_type,
            date_min=request.date_min,
            date_max=request.date_max,
            region_1=request.region_1,
            region_2=request.region_2,
            radius_meters=(
                request.radius_meters
                if request.region_type == RegionType.PLACE_RADIUS
                else None
            ),
            rows=rows,
            meta=meta,
        )
