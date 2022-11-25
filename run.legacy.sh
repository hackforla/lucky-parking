docker build . --file Dockerfile.legacy.dev --tag lucky-parking/base:latest --compress "$@"
docker compose -f docker-compose.legacy.dev.yaml up
