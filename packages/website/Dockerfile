# Use Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy pnpm lock and workspace files at the root
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY tsconfig.base.json ./

COPY packages/website ./packages/website
COPY packages/ui ./packages/ui

# Install global pnpm
RUN npm install -g pnpm

RUN npm install -g typescript

# Install dependencies
RUN pnpm install --frozen-lockfile --recursive

# Set working directory for website
WORKDIR /app/packages/website

RUN ls -al

RUN pnpm run build

# Start your app
CMD ["pnpm", "start"]
# CMD ["/bin/sh"]




