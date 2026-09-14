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

# Respect a customized POSTGRES_USER / POSTGRES_DB in .env.
$envFile = Join-Path $Root '.env'
if (Test-Path -LiteralPath $envFile) {
  Get-Content -LiteralPath $envFile | ForEach-Object {
    $line = $_.Trim()
    if ($line -eq '' -or $line.StartsWith('#')) { return }
    $eq = $line.IndexOf('=')
    if ($eq -lt 1) { return }
    $name = $line.Substring(0, $eq).Trim()
    $value = $line.Substring($eq + 1).Trim().Trim("'").Trim('"')
    if (-not [string]::IsNullOrEmpty($name) -and -not [Environment]::GetEnvironmentVariable($name)) {
      Set-Item -Path "Env:$name" -Value $value
    }
  }
}
$PgUser = if ($env:POSTGRES_USER) { $env:POSTGRES_USER } else { 'lucky' }
$PgDb = if ($env:POSTGRES_DB) { $env:POSTGRES_DB } else { 'lucky_parking' }

$sql | docker compose exec -T postgis psql -U $PgUser -d $PgDb -v ON_ERROR_STOP=0
