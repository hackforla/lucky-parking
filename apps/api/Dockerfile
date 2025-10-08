FROM node:lts-slim AS base
RUN corepack enable

FROM base AS pruner
WORKDIR /app
RUN pnpm add turbo
RUN pnpm turbo telemetry disable
COPY . .
RUN pnpm turbo prune @lucky-parking/api --docker

FROM base AS builder
WORKDIR /app
COPY --from=pruner /app/out/json/ .
RUN pnpm install
COPY --from=pruner /app/out/full/ .
RUN pnpm turbo build
RUN rm -rf node_modules && pnpm install --prod --frozen-lockfile

FROM gcr.io/distroless/nodejs22-debian12:nonroot AS runner
WORKDIR /app
COPY --from=builder --chown=nonroot:nonroot /app .
EXPOSE 3000
CMD ["apps/api/dist/index.js"]
