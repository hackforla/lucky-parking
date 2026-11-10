# Website citation contract

`POST /citations` requires the same API key guard as the chart routes unless
local unauthenticated mode is enabled. The website's Next.js server forwards
requests here; the browser never sends the service key directly.

```json
{
  "date_min": "2025-04-01",
  "date_max": "2025-04-30",
  "geometries": [{"type": "Point", "coordinates": [-118.44, 34.06]}],
  "radius_meters": 500,
  "limit": 1000,
  "offset": 0
}
```

One or two GeoJSON Point, Polygon, or MultiPolygon selections are supported.
Points use a radius in meters; polygons include their edges. Overlapping
selections are a union and never double-count a citation. Date bounds are
inclusive calendar dates using the existing loader's UTC timestamp convention.
Date spans are capped at 3,660 days. Geometry coordinates and sizes are validated.

The result is a GeoJSON FeatureCollection. Each point's properties contain
`ticket_number`, `issue_datetime`, `violation_code`, `violation_description`,
and `fine_amount`. Optional source values remain null.

The top-level `meta` includes:

| Field | Meaning |
| --- | --- |
| total | All matching citations |
| total_fine | Sum over all matches, with unknown fines contributing zero |
| average_fine | Average over known fine amounts |
| returned | Number of features in this page |
| limit / offset | Pagination settings; limit at most 10,000 |
| truncated | This page contains fewer markers than the full match count |
| next_offset | Next page offset, or null when no further page exists |
| radius_meters | Radius used for point selections |

Rows sort by issue datetime descending, then ticket number. The website shows
the first 1,000 markers and explicitly labels partial map results. Its summary
cards use complete totals. `GET /ready` verifies database/table access;
`GET /health` checks only application liveness.

The request schema is `CitationsRequest` in `lucky_parking/models.py`; website
validation and response types live in `apps/web/src/lib/citations/schema.ts`.
Keep both aligned when changing the contract. Existing `/chart` routes remain
available for named-region chart queries.
