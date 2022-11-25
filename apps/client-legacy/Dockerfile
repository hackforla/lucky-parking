FROM node:18-alpine AS dev

WORKDIR /app

COPY ./apps/client-legacy .

CMD npx nx serve client-legacy --verbose --host=0.0.0.0 --port=80
