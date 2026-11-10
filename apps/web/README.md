# Lucky Parking website

The main Next.js website uses the Python parking data API through its own `/api/v1/citations` server route. It does not
connect to PostgreSQL directly.

Local data service docs live in
[`projects/data-science/postgis_db/README.md`](../../projects/data-science/postgis_db/README.md) and
[`api/README.md`](../../projects/data-science/postgis_db/api/README.md).

For host development, copy `.env.example` to `.env.local`, set `MAPBOX_ACCESS_TOKEN`, and point `PARKING_API_URL` at the
local API (`http://127.0.0.1:8000` by default). Run `pnpm --filter @lucky-parking/web dev` from the repository root.
Keep `PARKING_API_KEY` server-side. No Socrata token or MongoDB service is needed.
