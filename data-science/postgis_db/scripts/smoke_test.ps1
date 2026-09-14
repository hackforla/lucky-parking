# End-to-end check of a running local stack: containers, tables, API, explorer.
#
#   .\scripts\smoke_test.ps1
#
# Run this after `docker compose up -d --build` finishes its first boot. Every
# check prints PASS or FAIL and the script exits non-zero if any FAIL, so a
# newcomer gets one clear answer instead of having to interpret logs.
#
# ASCII-only and no .NET Core-only APIs, so it runs under Windows PowerShell 5.1.
$ErrorActionPreference = 'Continue'

$Root = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $Root

# Load .env without overriding anything already in the environment.
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
$ApiPort = if ($env:API_PORT) { $env:API_PORT } else { '8000' }
$WebPort = if ($env:WEB_PORT) { $env:WEB_PORT } else { '8080' }
$Api = "http://127.0.0.1:$ApiPort"
$Web = "http://127.0.0.1:$WebPort"

$script:Pass = 0
$script:Fail = 0

function Write-Pass([string]$Message) {
  Write-Host "  PASS  $Message"
  $script:Pass++
}

function Write-Fail([string]$Message, [string]$Detail) {
  Write-Host "  FAIL  $Message"
  if ($Detail) { Write-Host "        $Detail" }
  $script:Fail++
}

# Returns the HTTP status code, or 0 if the connection failed outright.
function Get-HttpCode([string]$Url, [hashtable]$Headers) {
  try {
    $params = @{
      Uri                = $Url
      Method             = 'GET'
      TimeoutSec         = 15
      UseBasicParsing    = $true
      ErrorAction        = 'Stop'
    }
    if ($Headers) { $params['Headers'] = $Headers }
    $response = Invoke-WebRequest @params
    return [int]$response.StatusCode
  }
  catch [System.Net.WebException] {
    if ($_.Exception.Response) { return [int]$_.Exception.Response.StatusCode }
    return 0
  }
  catch {
    # PS 7 raises HttpResponseException instead of WebException.
    if ($_.Exception.PSObject.Properties['Response'] -and $_.Exception.Response) {
      return [int]$_.Exception.Response.StatusCode
    }
    return 0
  }
}

function Test-HttpCode([string]$Description, [int]$Expected, [string]$Url, [hashtable]$Headers) {
  $got = Get-HttpCode -Url $Url -Headers $Headers
  if ($got -eq $Expected) {
    Write-Pass "$Description ($got)"
  }
  else {
    Write-Fail $Description "expected HTTP $Expected, got $got"
  }
}

function Invoke-Psql([string]$Sql) {
  $out = docker compose exec -T postgis psql -U $PgUser -d $PgDb -tAc $Sql 2>&1
  if ($LASTEXITCODE -ne 0) { return $null }
  return ($out | Out-String).Trim()
}

Write-Host '== Containers =='

$psLines = @(docker compose ps --format '{{.Service}} {{.State}}' 2>&1)
foreach ($svc in @('postgis', 'api', 'web')) {
  $match = $psLines | Where-Object { $_ -match "^$svc\s" } | Select-Object -First 1
  $state = if ($match) { ($match -split '\s+')[1] } else { $null }
  if ($state -eq 'running') {
    Write-Pass "$svc is running"
  }
  else {
    $shown = if ($state) { $state } else { 'not found' }
    Write-Fail "$svc is running" "state: $shown. Try: docker compose ps"
  }
}

$healthLines = @(docker compose ps --format '{{.Service}} {{.Health}}' 2>&1)
$healthMatch = $healthLines | Where-Object { $_ -match '^postgis\s' } | Select-Object -First 1
$health = if ($healthMatch) { ($healthMatch -split '\s+')[1] } else { $null }
if ($health -eq 'healthy') {
  Write-Pass 'postgis is healthy'
}
else {
  $shown = if ($health) { $health } else { 'unknown' }
  Write-Fail 'postgis is healthy' "health: $shown. First boot is still loading; see docker compose logs -f postgis"
}

Write-Host ''
Write-Host '== Database =='

$ext = Invoke-Psql "SELECT 1 FROM pg_extension WHERE extname='postgis'"
if ($ext -eq '1') {
  Write-Pass 'postgis extension present'
}
else {
  Write-Fail 'postgis extension present' 'could not query pg_extension'
}

# Every boundary layer must be non-empty. An empty table here is the classic
# "init partially ran on an existing volume" symptom.
foreach ($table in @('neighborhood_councils', 'neighborhoods', 'zipcodes', 'council_districts', 'places')) {
  $rows = Invoke-Psql "SELECT count(*) FROM $table"
  if ($rows -match '^\d+$' -and [int]$rows -gt 0) {
    Write-Pass "$table has $rows rows"
  }
  else {
    Write-Fail "$table has rows" "got '$rows'. Try: scripts\reload_boundaries_docker.cmd"
  }
}

$citationsRaw = Invoke-Psql 'SELECT count(*) FROM citations'
$citations = if ($citationsRaw -match '^\d+$') { [int]$citationsRaw } else { -1 }
if ($citations -gt 0) {
  Write-Pass "citations has $citations rows"
}
else {
  Write-Fail 'citations has rows' "got '$citationsRaw'. Still loading, or the CSV was missing."
}

Write-Host ''
Write-Host '== Contract API =='

Test-HttpCode 'GET /health' 200 "$Api/health"

# With ALLOW_UNAUTHENTICATED=1 (local default) guarded routes return 200; with
# auth on they return 401 without a key. Both prove the app is wired up; a 0
# (no connection) or 500 does not.
$code = Get-HttpCode "$Api/chart-types"
if ($code -eq 200) {
  Write-Pass 'GET /chart-types (200 - auth disabled for local dev)'
}
elseif ($code -eq 401) {
  Write-Pass 'GET /chart-types (401 - API key required, as in production)'
}
else {
  Write-Fail 'GET /chart-types' "expected 200 or 401, got $code"
}

$headers = $null
if ($env:API_KEYS) {
  $headers = @{ 'X-API-Key' = ($env:API_KEYS -split ',')[0].Trim() }
}

Test-HttpCode 'GET /regions' 200 "$Api/regions?region_type=Zip%20Code&limit=3" $headers

# A real chart query exercises the spatial join, which is what actually breaks
# when boundaries loaded but citations did not (or vice versa).
if ($citations -gt 0) {
  $body = '{"region_type":"Zip Code","region":"90024","date_min":"2000-01-01","date_max":"2035-12-31","chart_type":"Total # Citations"}'
  $postHeaders = @{ 'Content-Type' = 'application/json' }
  if ($headers) { $postHeaders['X-API-Key'] = $headers['X-API-Key'] }
  try {
    $response = Invoke-WebRequest -Uri "$Api/chart" -Method Post -Body $body `
      -Headers $postHeaders -TimeoutSec 60 -UseBasicParsing -ErrorAction Stop
    if ($response.Content -match '"rows"') {
      Write-Pass 'POST /chart returned a ChartResult'
    }
    else {
      $snippet = $response.Content.Substring(0, [Math]::Min(160, $response.Content.Length))
      Write-Fail 'POST /chart returned a ChartResult' $snippet
    }
  }
  catch {
    Write-Fail 'POST /chart returned a ChartResult' $_.Exception.Message
  }
}
else {
  Write-Host '  SKIP  POST /chart (no citations loaded yet)'
}

Write-Host ''
Write-Host '== Explorer UI =='

$code = Get-HttpCode "$Web/"
if ($code -eq 200) {
  Write-Pass 'GET / (200 - auth disabled for local dev)'
}
elseif ($code -eq 401) {
  Write-Pass 'GET / (401 - basic auth required, as in production)'
}
else {
  Write-Fail 'GET /' "expected 200 or 401, got $code"
}

Test-HttpCode 'GET /static/style.css' 200 "$Web/static/style.css"

Write-Host ''
Write-Host '== Summary =='
Write-Host "  $script:Pass passed, $script:Fail failed"
if ($script:Fail -gt 0) {
  Write-Host ''
  Write-Host 'Not all checks passed. If this is a fresh install, first boot may still'
  Write-Host 'be loading - watch it with:  docker compose logs -f postgis'
  Write-Host 'To start completely over:    docker compose down -v; docker compose up -d --build'
  exit 1
}
Write-Host '  Stack looks healthy.'
