FROM node:14-alpine as build-stage

WORKDIR /app

# Copy package.json, pnpm-lock.yaml, and .pnpm-store to the container
COPY package*.json pnpm-lock.yaml .pnpm-store ./

# Install pnpm globally
RUN npm install -g pnpm

# Install dependencies using pnpm
RUN pnpm install

COPY . .

RUN npm run build

EXPOSE 80

