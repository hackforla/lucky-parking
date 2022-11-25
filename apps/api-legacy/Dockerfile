FROM node:18-alpine AS dev

WORKDIR /app

COPY ./apps/api-legacy .

CMD npx nx serve api-legacy --verbose --host=0.0.0.0
