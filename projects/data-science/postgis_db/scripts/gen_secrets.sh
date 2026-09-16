#!/usr/bin/env bash
# Print a fresh set of production secrets to stdout, ready to append to .env.
#
#   bash scripts/gen_secrets.sh >> .env
#
# Issue one API key per consumer so a single key can be revoked without
# disturbing the others: bash scripts/gen_secrets.sh --api-key-only
set -euo pipefail

rand() {
  # url-safe base64 from the system CSPRNG; trim padding for easier copy/paste.
  openssl rand -base64 "$1" | tr -d '\n=+/' | cut -c "1-$2"
}

if [[ "${1:-}" == "--api-key-only" ]]; then
  echo "lp_$(rand 48 40)"
  exit 0
fi

cat <<EOF

# --- generated $(date -u +%Y-%m-%dT%H:%M:%SZ) by scripts/gen_secrets.sh ---
POSTGRES_PASSWORD=$(rand 32 32)
WEB_USER=explorer
WEB_PASSWORD=$(rand 32 24)
# Comma-separated. Add one key per consumer; remove a key to revoke it.
API_KEYS=lp_$(rand 48 40)
EOF
