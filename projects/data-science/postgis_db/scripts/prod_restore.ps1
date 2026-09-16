# Restore a pg_dump into the production compose stack.
#
# Usage (from postgis_db/):
#   New-Item -ItemType Directory -Force dumps | Out-Null
#   Copy-Item lucky_parking.dump dumps\
#   .\scripts\prod_restore.ps1 dumps\lucky_parking.dump
#
# Requires: docker compose -f docker-compose.prod.yml up -d (postgis healthy)
$ErrorActionPreference = 'Stop'

$Root = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $Root

$ComposeFile = if ($env:COMPOSE_FILE) { $env:COMPOSE_FILE } else { 'docker-compose.prod.yml' }
$Dump = if ($args.Count -ge 1) { $args[0] } else { 'dumps/lucky_parking.dump' }

if (-not (Test-Path -LiteralPath $Dump -PathType Leaf)) {
  [Console]::Error.WriteLine("Dump not found: $Dump")
  exit 1
}

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

Write-Host 'Copying dump into postgis container...'
docker compose -f $ComposeFile cp $Dump 'postgis:/tmp/lucky_parking.dump'
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host 'Restoring (this may take several minutes)...'
docker compose -f $ComposeFile exec -T postgis pg_restore -U $PgUser -d $PgDb --clean --if-exists --no-owner /tmp/lucky_parking.dump
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host 'Verifying row counts...'
docker compose -f $ComposeFile exec -T postgis psql -U $PgUser -d $PgDb -c @'
SELECT
  (SELECT count(*) FROM citations) AS citations,
  (SELECT count(*) FROM zipcodes) AS zipcodes,
  (SELECT count(*) FROM places) AS places;
'@
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host 'Done.'
