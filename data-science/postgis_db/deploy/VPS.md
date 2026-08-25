# Deploy Lucky Parking to a VPS — DB + API + explorer UI

Provider-agnostic checklist (Hetzner, DigitalOcean, Linode, IONOS, etc.). Target a box with about **4 GB RAM** and **≥80 GB disk**. Load citations locally, then restore a `pg_dump` on the VPS — do not run the full CSV import on a small host.

Stack: **PostGIS (private)** + **contract API** (:8000) + **citation explorer** (:8080).

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

## 2. Provision the VPS

1. Order a VPS (Ubuntu 24.04 LTS is a good default).
2. SSH in as root; create a deploy user with sudo.
3. Install Docker:

   ```bash
   curl -fsSL https://get.docker.com | sh
   sudo usermod -aG docker "$USER"
   # log out and back in
   ```

4. Firewall (UFW example):

   ```bash
   sudo ufw allow OpenSSH
   sudo ufw allow 8000/tcp   # API — or 443 if using nginx later
   sudo ufw allow 8080/tcp   # explorer UI (optional; restrict by IP in prod)
   sudo ufw enable
   ```

   **Do not** open port 5432.

---

## 3. Copy the project to the VPS

From your laptop (replace `user` and `vps-ip`):

```bash
rsync -avz --exclude raw_data --exclude .venv --exclude __pycache__ \
  postgis_db/ user@vps-ip:~/lucky-parking/postgis_db/

scp dumps/lucky_parking.dump user@vps-ip:~/lucky-parking/postgis_db/dumps/
```

---

## 4. Configure and start production compose

On the VPS:

```bash
cd ~/lucky-parking/postgis_db
cp .env.example .env
nano .env   # set POSTGRES_PASSWORD to a strong secret
```

```bash
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f postgis
# Wait until postgis is healthy (boundaries load on first empty volume).
```

---

## 5. Restore the dump

```bash
bash scripts/prod_restore.sh dumps/lucky_parking.dump
```

On Windows PowerShell: `.\scripts\prod_restore.ps1 dumps\lucky_parking.dump`

---

## 6. Smoke test

```bash
curl -s http://localhost:8000/health
curl -s "http://localhost:8000/regions?region_type=Zip%20Code&limit=3"
curl -s http://localhost:8000/chart \
  -H "Content-Type: application/json" \
  -d '{
    "region_type": "Zip Code",
    "region": "90024",
    "date_min": "2024-01-01",
    "date_max": "2024-12-31",
    "chart_type": "Total # Citations"
  }'
curl -s http://localhost:8000/chart/compare \
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

Browser (replace with your VPS IP):

- API docs (field-level schemas): `http://VPS_IP:8000/docs`
- Explorer UI: `http://VPS_IP:8080`

Neither app has authentication. Errors: `404` unknown region, `422` invalid body, `503` `/regions` if PostGIS is down. See the README HTTP API section.

---

## 7. Hardening (before sharing widely)

- [ ] Change default passwords; never commit `.env`
- [ ] Restrict `:8080` / `:8000` to your IP or put **nginx + TLS** in front
- [ ] Add HTTP basic auth or OAuth on the explorer if public
- [ ] Set up `docker compose` restart policies (already `unless-stopped`)
- [ ] Optional: provider snapshot/backup for the `postgis_data` volume

---

## Architecture

```
Internet → :8000 api (FastAPI /chart, /regions)
         → :8080 web (explorer UI)
              ↓ DATABASE_URL (Docker network)
         postgis:5432 (not exposed to host)
```

---

## Updating data later

1. Re-dump locally after refreshing citations.
2. `scp` new dump to VPS `dumps/`.
3. `bash scripts/prod_restore.sh dumps/lucky_parking.dump`

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| API 503 / connection errors | `docker compose -f docker-compose.prod.yml ps` — wait for postgis healthy |
| Empty charts | Citations not restored — run `prod_restore.sh` |
| OOM on ~2 GB hosts | Use ~4 GB RAM or lower `COMPOSE_MEM_LIMIT_*` and run API **or** web, not both |
| Init + restore conflict | Keep `SKIP_CITATIONS_LOAD=1`; restore full dump after boundary init |

Local compose (`docker compose up`) also starts API (:8000) and explorer (:8080), and still publishes :5432 for tools.
