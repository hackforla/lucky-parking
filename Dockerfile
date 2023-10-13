FROM node:20-alpine AS base
ENV CI=true
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN apk add g++ make py3-pip
COPY . /app
WORKDIR /app

FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM base AS builds
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm build

FROM ubuntu:latest AS website
RUN apt-get update
RUN apt-get install nginx -y
COPY --from=builds /app/packages/website/dist /var/www/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
