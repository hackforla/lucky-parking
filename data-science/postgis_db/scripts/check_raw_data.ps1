# Host-side preflight: ensure raw_data/ and a Parking_Citations_*.csv exist
# before first-boot docker compose (which mounts ./raw_data → /raw_data).
$ErrorActionPreference = 'Stop'

$Root = Split-Path -Parent $PSScriptRoot
$RawDir = Join-Path $Root 'raw_data'

function Write-Err([string]$Message) {
  [Console]::Error.WriteLine($Message)
}

if (-not (Test-Path -LiteralPath $RawDir -PathType Container)) {
  Write-Err "ERROR: missing directory: $RawDir"
  Write-Err 'Create it and add a city dump, e.g. Parking_Citations_YYYYMMDD.csv'
  exit 1
}

$candidates = @(Get-ChildItem -LiteralPath $RawDir -Filter 'Parking_Citations_*.csv' -File -ErrorAction SilentlyContinue)
if ($candidates.Count -eq 0) {
  Write-Err "ERROR: no Parking_Citations_*.csv in $RawDir"
  exit 1
}

$csv = $candidates | Sort-Object Name | Select-Object -Last 1
if ($csv.Length -eq 0) {
  Write-Err "ERROR: citations CSV missing or empty: $($csv.FullName)"
  exit 1
}

function Format-Size([long]$Bytes) {
  if ($Bytes -ge 1GB) { '{0:N1}G' -f ($Bytes / 1GB) }
  elseif ($Bytes -ge 1MB) { '{0:N1}M' -f ($Bytes / 1MB) }
  elseif ($Bytes -ge 1KB) { '{0:N0}K' -f ($Bytes / 1KB) }
  else { "$Bytes B" }
}

Write-Host "OK: $($csv.FullName) ($(Format-Size $csv.Length))"
