#!/usr/bin/env bash
# End-to-end check of a running local stack: containers, tables, API, explorer.
#
#   bash scripts/smoke_test.sh
#
# Run this after `docker compose up -d --build` finishes its first boot. Every
# check prints PASS or FAIL and the script exits non-zero if any FAIL, so a
# newcomer gets one clear answer instead of having to interpret logs.
set -uo pipefail

cd "$(dirname "$0")/.."

# shellcheck disable=SC1091
source .env 2>/dev/null || true
PGUSER="${POSTGRES_USER:-lucky}"
PGDB="${POSTGRES_DB:-lucky_parking}"
API="http://127.0.0.1:${API_PORT:-8000}"
WEB="http://127.0.0.1:${WEB_PORT:-8080}"

pass=0
fail=0

ok() {
  printf '  PASS  %s\n' "$1"
  pass=$((pass + 1))
}

no() {
  printf '  FAIL  %s\n' "$1"
  [[ -n "${2:-}" ]] && printf '        %s\n' "$2"
  fail=$((fail + 1))
}

check() {
  # check <description> <command...>  — passes if the command exits 0.
  local desc="$1"
  shift
  local output
  if output="$("$@" 2>&1)"; then
    ok "$desc"
  else
    no "$desc" "${output%%$'\n'*}"
  fi
}

# curl is the one host dependency; everything else runs inside containers.
if ! command -v curl >/dev/null 2>&1; then
  echo "ERROR: curl is required." >&2
  exit 1
fi

http_code() { curl -s -o /dev/null -w '%{http_code}' --max-time 15 "$@"; }

expect_code() {
  # expect_code <description> <expected> <curl args...>
  local desc="$1" want="$2"
  shift 2
  local got
  got="$(http_code "$@")"
  if [[ "$got" == "$want" ]]; then
    ok "$desc ($got)"
  else
    no "$desc" "expected HTTP $want, got $got"
  fi
}

echo "== Containers =="

for svc in postgis api web; do
  state="$(docker compose ps --format '{{.Service}} {{.State}}' 2>/dev/null | awk -v s="$svc" '$1==s {print $2}')"
  if [[ "$state" == "running" ]]; then
    ok "$svc is running"
  else
    no "$svc is running" "state: ${state:-not found}. Try: docker compose ps"
  fi
done

health="$(docker compose ps --format '{{.Service}} {{.Health}}' 2>/dev/null | awk '$1=="postgis" {print $2}')"
if [[ "$health" == "healthy" ]]; then
  ok "postgis is healthy"
else
  no "postgis is healthy" "health: ${health:-unknown}. First boot is still loading; see docker compose logs -f postgis"
fi

echo
echo "== Database =="

psql_q() {
  docker compose exec -T postgis psql -U "$PGUSER" -d "$PGDB" -tAc "$1" 2>/dev/null
}

check "postgis extension present" bash -c "[[ \"\$(docker compose exec -T postgis psql -U '$PGUSER' -d '$PGDB' -tAc \"SELECT 1 FROM pg_extension WHERE extname='postgis'\" 2>/dev/null | tr -d '[:space:]')\" == 1 ]]"

# Every boundary layer must be non-empty. An empty table here is the classic
# "init partially ran on an existing volume" symptom.
for table in neighborhood_councils neighborhoods zipcodes council_districts places; do
  rows="$(psql_q "SELECT count(*) FROM ${table}" | tr -d '[:space:]')"
  if [[ "$rows" =~ ^[0-9]+$ ]] && ((rows > 0)); then
    ok "$table has $rows rows"
  else
    no "$table has rows" "got '${rows:-<none>}'. Try: bash scripts/reload_boundaries_docker.sh"
  fi
done

citations="$(psql_q "SELECT count(*) FROM citations" | tr -d '[:space:]')"
if [[ "$citations" =~ ^[0-9]+$ ]] && ((citations > 0)); then
  ok "citations has $citations rows"
else
  no "citations has rows" "got '${citations:-<none>}'. Still loading, or the CSV was missing."
fi

echo
echo "== Contract API =="

expect_code "GET /health" 200 "$API/health"

# With ALLOW_UNAUTHENTICATED=1 (local default) guarded routes return 200; with
# auth on they return 401 without a key. Both prove the app is wired up; a 000
# (no connection) or 500 does not.
code="$(http_code "$API/chart-types")"
case "$code" in
  200) ok "GET /chart-types (200 — auth disabled for local dev)" ;;
  401) ok "GET /chart-types (401 — API key required, as in production)" ;;
  *) no "GET /chart-types" "expected 200 or 401, got $code" ;;
esac

api_key=""
if [[ -n "${API_KEYS:-}" ]]; then
  api_key="${API_KEYS%%,*}"
fi

# macOS ships bash 3.2, where "${arr[@]}" on an empty array trips `set -u`.
# The ${arr[@]+...} guard expands to nothing instead of erroring.
auth_args=()
[[ -n "$api_key" ]] && auth_args=(-H "X-API-Key: $api_key")

expect_code "GET /regions" 200 ${auth_args[@]+"${auth_args[@]}"} \
  "$API/regions?region_type=Zip%20Code&limit=3"

# A real chart query exercises the spatial join, which is what actually breaks
# when boundaries loaded but citations did not (or vice versa). The window is
# derived from the data because the contract caps a range at 3660 days and the
# CSV's years differ between dumps.
if ((citations > 0)); then
  date_max="$(psql_q "SELECT to_char(max(issue_datetime), 'YYYY-MM-DD') FROM citations" | tr -d '[:space:]')"
  date_min="$(psql_q "SELECT to_char(max(issue_datetime) - interval '1 year', 'YYYY-MM-DD') FROM citations" | tr -d '[:space:]')"
  if [[ -z "$date_max" || -z "$date_min" ]]; then
    no "POST /chart returned a ChartResult" "could not read the citation date range"
  else
    body="$(curl -s --max-time 60 ${auth_args[@]+"${auth_args[@]}"} \
      -H 'Content-Type: application/json' \
      -d "{\"region_type\":\"Zip Code\",\"region\":\"90024\",\"date_min\":\"${date_min}\",\"date_max\":\"${date_max}\",\"chart_type\":\"Total # Citations\"}" \
      "$API/chart" 2>&1)"
    if grep -q '"rows"' <<<"$body"; then
      ok "POST /chart returned a ChartResult ($date_min to $date_max)"
    else
      no "POST /chart returned a ChartResult" "${body:0:160}"
    fi
  fi
else
  printf '  SKIP  POST /chart (no citations loaded yet)\n'
fi

echo
echo "== Explorer UI =="

code="$(http_code "$WEB/")"
case "$code" in
  200) ok "GET / (200 — auth disabled for local dev)" ;;
  401) ok "GET / (401 — basic auth required, as in production)" ;;
  *) no "GET /" "expected 200 or 401, got $code" ;;
esac

expect_code "GET /static/style.css" 200 "$WEB/static/style.css"

echo
echo "== Summary =="
printf '  %d passed, %d failed\n' "$pass" "$fail"
if ((fail > 0)); then
  echo
  echo "Not all checks passed. If this is a fresh install, first boot may still"
  echo "be loading — watch it with:  docker compose logs -f postgis"
  echo "To start completely over:     docker compose down -v && docker compose up -d --build"
  exit 1
fi
echo "  Stack looks healthy."
