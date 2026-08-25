# Row counts for boundary layers + citations (tolerates missing tables on old volumes).
$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $Root

$sql = @'
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
'@

$sql | docker compose exec -T postgis psql -U lucky -d lucky_parking -v ON_ERROR_STOP=0
