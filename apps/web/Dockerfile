FROM node:lts-slim AS base
RUN corepack enable

FROM base AS pruner
WORKDIR /app
RUN pnpm add turbo
RUN pnpm turbo telemetry disable
COPY . .
RUN pnpm turbo prune @lucky-parking/web --docker

FROM base AS builder
WORKDIR /app
COPY --from=pruner /app/out/json/ .
RUN pnpm install
COPY --from=pruner /app/out/full/ .
RUN pnpm turbo build

FROM nginx:alpine-slim AS runner
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
