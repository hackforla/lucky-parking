# Host-side: reload all boundary / place tables into a running compose service.
# Paths are resolved from this script's location (portable across machines).
$ErrorActionPreference = 'Stop'

$Root = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $Root

$Service = if ($env:COMPOSE_SERVICE) { $env:COMPOSE_SERVICE } else { 'postgis' }

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  [Console]::Error.WriteLine('ERROR: docker not found on PATH')
  exit 1
}

Write-Host "Reloading boundaries via docker compose service '$Service'..."
docker compose exec -T $Service env BOUNDARY_GEOJSON_DIR=/data bash /usr/local/lib/lucky-parking/load_boundaries.sh
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
