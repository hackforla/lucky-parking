# Host-side preflight: ensure all boundary GeoJSON files exist under boundaries/.
# Paths are relative to this repo (no machine-specific absolute paths).
$ErrorActionPreference = 'Stop'

$Root = Split-Path -Parent $PSScriptRoot
$BoundariesDir = if ($env:BOUNDARIES_DIR) { $env:BOUNDARIES_DIR } else { Join-Path $Root 'boundaries' }

$Layers = @(
  'neighborhood_councils'
  'zipcodes'
  'council_districts'
  'neighborhoods'
  'places'
)

function Format-Size([long]$Bytes) {
  if ($Bytes -ge 1MB) { '{0:N1}M' -f ($Bytes / 1MB) }
  elseif ($Bytes -ge 1KB) { '{0:N0}K' -f ($Bytes / 1KB) }
  else { "$Bytes B" }
}

function Write-Err([string]$Message) {
  [Console]::Error.WriteLine($Message)
}

$missing = $false
foreach ($name in $Layers) {
  $src = Join-Path (Join-Path $BoundariesDir $name) "$name.geojson"
  if (-not (Test-Path -LiteralPath $src) -or (Get-Item -LiteralPath $src).Length -eq 0) {
    Write-Err "ERROR: missing or empty: $src"
    $missing = $true
  } else {
    $size = Format-Size (Get-Item -LiteralPath $src).Length
    Write-Host "OK: $src ($size)"
  }
}

if ($missing) {
  Write-Err "ERROR: one or more boundary GeoJSON files are missing under $BoundariesDir"
  exit 1
}

Write-Host 'All boundary GeoJSON sources present.'
