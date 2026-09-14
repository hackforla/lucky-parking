# Deploy Lucky Parking to a VPS — DB + API + explorer UI

Provider-agnostic checklist (Hetzner, DigitalOcean, Linode, IONOS, etc.). Target a box with about **4 GB RAM** and **≥80 GB disk**. Load citations locally, then restore a `pg_dump` on the VPS — do not run the full CSV import on a small host.

Stack: **Caddy** (TLS, the only thing exposed) → **contract API** + **citation explorer** → **PostGIS** (private).

```text
Internet ──443──▶ caddy ──▶ api:8000   (X-API-Key)
                       └──▶ web:8080   (HTTP basic auth)
                                 │ DATABASE_URL (private network)
                                 ▼
                            postgis:5432
```

---

## 1. Build the database locally

On your dev machine (with Docker):

```bash
cd postgis_db
docker compose up -d --build
# Wait for boundaries + citations, or:
# .venv/bin/python scripts/load_contract_citations.py

docker compose exec postgis pg_dump -U lucky -d lucky_parking -Fc -f /tmp/lucky_parking.dump
docker compose cp postgis:/tmp/lucky_parking.dump ./dumps/lucky_parking.dump
ls -lh dumps/lucky_parking.dump
```

---

## 2. Point DNS at the VPS

Create two `A` records before starting Compose — Caddy cannot obtain
certificates for a name that does not resolve to this host:

| Record | Points to | Becomes |
|--------|-----------|---------|
| `api.example.org` | VPS IPv4 | `API_DOMAIN` |
| `explorer.example.org` | VPS IPv4 | `WEB_DOMAIN` |

Add matching `AAAA` records if the VPS has IPv6. Verify with
`dig +short api.example.org`.

No DNS name yet? See [Option: no domain](#option-no-domain) below.

---

## 3. Provision the VPS

1. Order a VPS (Ubuntu 24.04 LTS is a good default).
2. SSH in as root; create a deploy user with sudo.
3. Install Docker:

   ```bash
   curl -fsSL https://get.docker.com | sh
   sudo usermod -aG docker "$USER"
   # log out and back in
   ```

4. Firewall (UFW example) — Caddy is the only public listener:

   ```bash
   sudo ufw allow OpenSSH
   sudo ufw allow 80/tcp    # ACME HTTP challenge + redirect to HTTPS
   sudo ufw allow 443/tcp
   sudo ufw allow 443/udp   # HTTP/3
   sudo ufw enable
   ```

   **Do not** open 5432, 8000, or 8080. Prod compose binds the API and explorer
   to `127.0.0.1` so they are reachable only from the box itself.

---

## 4. Copy the project to the VPS

From your laptop (replace `user` and `vps-ip`):

```bash
rsync -avz --exclude raw_data --exclude .venv --exclude __pycache__ --exclude .env \
  postgis_db/ user@vps-ip:~/lucky-parking/postgis_db/

scp dumps/lucky_parking.dump user@vps-ip:~/lucky-parking/postgis_db/dumps/
```

`.env` is excluded on purpose — generate credentials on the VPS instead of
copying your local ones.

---

## 5. Generate credentials

On the VPS:

```bash
cd ~/lucky-parking/postgis_db
cp .env.example .env
bash scripts/gen_secrets.sh >> .env   # POSTGRES_PASSWORD, API_KEYS, WEB_USER/PASSWORD
chmod 600 .env
nano .env                             # set API_DOMAIN, WEB_DOMAIN, ACME_EMAIL
```

Confirm before starting — Compose refuses to start if any is blank:

```bash
grep -E '^(POSTGRES_PASSWORD|API_KEYS|WEB_PASSWORD|API_DOMAIN|WEB_DOMAIN|ACME_EMAIL)=' .env
```

Also make sure `ALLOW_UNAUTHENTICATED` is `0` or absent, and `API_DOCS_PUBLIC`
is `0` or absent.

---

## 6. Start production compose

```bash
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f postgis
# Wait until postgis is healthy (boundaries load on first empty volume).
```

Then check that certificates were issued:

```bash
docker compose -f docker-compose.prod.yml logs caddy | grep -i certificate
```

---

## 7. Restore the dump

```bash
bash scripts/prod_restore.sh dumps/lucky_parking.dump
```

On Windows PowerShell: `.\scripts\prod_restore.ps1 dumps\lucky_parking.dump`

---

## 8. Smoke test

On the VPS, against the loopback ports (skips TLS, still needs a key). Put the
key in a shell variable so it stays out of your shell history:

```bash
read -rs LP_API_KEY   # paste a value from API_KEYS

curl -s http://127.0.0.1:8000/health

# No key ⇒ 401, and no data
curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:8000/chart-types

curl -s -H "X-API-Key: $LP_API_KEY" \
  "http://127.0.0.1:8000/regions?region_type=Zip%20Code&limit=3"

curl -s http://127.0.0.1:8000/chart \
  -H "X-API-Key: $LP_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "region_type": "Zip Code",
    "region": "90024",
    "date_min": "2024-01-01",
    "date_max": "2024-12-31",
    "chart_type": "Total # Citations"
  }'
curl -s http://127.0.0.1:8000/chart/compare \
  -H "X-API-Key: $LP_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "region_type": "Neighborhood",
    "region_1": "Westwood",
    "region_2": "Hollywood",
    "date_min": "2024-01-01",
    "date_max": "2024-12-31",
    "chart_type": "Total # Citations"
  }'
```

From your laptop, through Caddy:

```bash
curl -s https://api.example.org/health
curl -sI http://api.example.org/health | head -1   # expect 308 → https
curl -s -H "X-API-Key: $LP_API_KEY" \
  "https://api.example.org/regions?region_type=Zip%20Code&limit=3"
```

Browser: `https://explorer.example.org` prompts for `WEB_USER` / `WEB_PASSWORD`.

Errors: `401` missing/bad key, `404` unknown region, `422` invalid body, `429`
rate limited, `503` database unavailable or credentials unconfigured. See the
README HTTP API section.

---

## 9. Sharing access

Issue **one API key per consumer** so any single one can be revoked alone:

```bash
bash scripts/gen_secrets.sh --api-key-only    # prints one lp_… key
nano .env                                     # append to the API_KEYS list
docker compose -f docker-compose.prod.yml up -d api
```

Send the key and the URL separately, and tell the recipient it goes in an
`X-API-Key` header. To revoke, delete that entry from `API_KEYS` and re-run the
`up -d api` above.

Rotating `WEB_PASSWORD` works the same way with `up -d web`. Rotating
`POSTGRES_PASSWORD` is different: it is baked in at initdb time, so change it
with `ALTER USER lucky WITH PASSWORD …` inside the container **and** in `.env`,
or recreate the volume and restore the dump again.

---

## Option: no domain

For a private test with no DNS name, replace the two domain blocks in
[`Caddyfile`](Caddyfile) with a single site block and Caddy's internal CA:

```caddyfile
:443 {
	tls internal
	import common
	reverse_proxy /api/* api:8000
	reverse_proxy web:8080
}
```

Browsers will warn about the self-signed certificate. Use this only as a
stopgap — `tls internal` certificates cannot be validated by people you share
the URL with.

---

## Hardening checklist

- [ ] `.env` is `chmod 600`, generated on the VPS, and never committed
- [ ] `ALLOW_UNAUTHENTICATED` unset or `0`; `API_DOCS_PUBLIC` unset or `0`
- [ ] UFW allows only 22, 80, 443 — not 5432/8000/8080
- [ ] `https://` serves both domains; `http://` redirects
- [ ] Unauthenticated `curl` returns `401`
- [ ] One API key per consumer, so revocation is per-consumer
- [ ] Unattended security upgrades enabled (`sudo apt install unattended-upgrades`)
- [ ] Provider snapshot/backup covering the `postgis_data` volume
- [ ] SSH is key-only (`PasswordAuthentication no`)

---

## Updating data later

1. Re-dump locally after refreshing citations.
2. `scp` new dump to VPS `dumps/`.
3. `bash scripts/prod_restore.sh dumps/lucky_parking.dump`

Rebuild after pulling code changes:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Compose exits with `required variable … is missing` | A credential in `.env` is blank — run `scripts/gen_secrets.sh` |
| Every API call returns `503` | `API_KEYS` is empty; the app fails closed by design |
| Every explorer page returns `503` | `WEB_USER` / `WEB_PASSWORD` are unset |
| Caddy cannot get a certificate | DNS does not resolve to this host yet, or 80/443 are blocked; check `docker compose -f docker-compose.prod.yml logs caddy` |
| Let's Encrypt rate limit hit | Uncomment `acme_ca` (staging) in the Caddyfile while testing |
| API `503` / connection errors | `docker compose -f docker-compose.prod.yml ps` — wait for postgis healthy |
| Queries fail after ~15 s | `DB_STATEMENT_TIMEOUT_MS` cancelled them; narrow the date range or raise it |
| Sporadic `429` | Raise `RATE_LIMIT_PER_MINUTE` or give the heavy consumer its own key |
| Empty charts | Citations not restored — run `prod_restore.sh` |
| OOM on ~2 GB hosts | Use ~4 GB RAM or lower `COMPOSE_MEM_LIMIT_*` and run API **or** web, not both |
| Init + restore conflict | Keep `SKIP_CITATIONS_LOAD=1`; restore full dump after boundary init |

Local compose (`docker compose up`) skips Caddy, runs API (:8000) and explorer (:8080) with auth disabled, and still publishes :5432 for tools.
