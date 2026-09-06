# syntax=docker/dockerfile:1

FROM node:24-slim AS base

RUN corepack enable

FROM base AS pruner
WORKDIR /app
ENV TURBO_TELEMETRY_DISABLED=1

COPY . .

RUN pnpm dlx turbo@2.10.12 prune @lucky-parking/api --docker

FROM base AS builder
WORKDIR /app

COPY --from=pruner /app/out/json/ .

RUN pnpm install --frozen-lockfile

COPY --from=pruner /app/out/full/ .

RUN pnpm turbo build
RUN rm -rf node_modules && \
    pnpm install --prod --frozen-lockfile --ignore-scripts

FROM gcr.io/distroless/nodejs24-debian12:nonroot AS runner
WORKDIR /app

COPY --from=builder --chown=nonroot:nonroot /app .

EXPOSE 3001

CMD ["apps/api/dist/index.js"]
