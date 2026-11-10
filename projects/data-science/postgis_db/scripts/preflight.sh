#!/usr/bin/env bash
# Verify boundaries + citations CSV and write .env before: docker compose up -d --build
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
bash "${DIR}/ensure_env.sh"
bash "${DIR}/check_boundaries.sh"
bash "${DIR}/check_raw_data.sh"
