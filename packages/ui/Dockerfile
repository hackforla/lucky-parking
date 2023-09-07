FROM node:14-alpine as build-stage

WORKDIR /app

COPY ../../package*.json ../../pnpm-lock.yaml ./

# Install pnpm globally
RUN npm install -g pnpm

# Install dependencies using pnpm
RUN pnpm install

COPY . .

RUN npm run build

EXPOSE 80

