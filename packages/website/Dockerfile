FROM node:14-alpine as build-stage

WORKDIR /app

RUN npm install -g pnpm

COPY ../../package*.json ../../pnpm-lock.yaml ./

RUN pnpm install

COPY . .

RUN npm run build

EXPOSE 8080
