#!/usr/bin/env bash
# Row counts for boundary layers + citations (tolerates missing tables on old volumes).
set -euo pipefail
cd "$(dirname "$0")/.."

docker compose exec -T postgis psql -U lucky -d lucky_parking -v ON_ERROR_STOP=0 <<'SQL'
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'neighborhood_councils', 'neighborhoods', 'zipcodes',
    'council_districts', 'places', 'citations'
  )
ORDER BY tablename;

SELECT 'neighborhood_councils' AS layer, count(*)::text AS rows FROM neighborhood_councils
UNION ALL SELECT 'neighborhoods', count(*)::text FROM neighborhoods
UNION ALL SELECT 'zipcodes', count(*)::text FROM zipcodes
UNION ALL SELECT 'council_districts', count(*)::text FROM council_districts
UNION ALL SELECT 'places', count(*)::text FROM places
UNION ALL SELECT 'citations', count(*)::text FROM citations;

SELECT min(issue_datetime) AS min_dt, max(issue_datetime) AS max_dt
FROM citations;
SQL
