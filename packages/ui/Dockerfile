FROM node:18-alpine as build-stage

WORKDIR /app

COPY . .

RUN npm install -g pnpm

RUN npm install -g create-vite

RUN pnpm install

RUN npm run build

EXPOSE 80

