FROM node:14-alpine as build-stage

COPY ../../package*.json ../../pnpm-lock.yaml ./

# Install pnpm globally
RUN npm install -g pnpm

# Install dependencies using pnpm
RUN pnpm install

WORKDIR /app

COPY . .

RUN npm run build

EXPOSE 80

