# Use Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy pnpm lock and workspace files at the root
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY tsconfig.base.json ./

# Copy just the package.json and pnpm-lock.yaml for website
COPY packages/website/package.json ./packages/website/
COPY packages/ui/package.json ./packages/ui/

# Install global pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install --frozen-lockfile --recursive

WORKDIR /app/packages/website
RUN pnpm install typescript --save-dev

# Copy all other files for website
COPY packages/website ./packages/website
COPY packages/ui ./packages/ui

# Set working directory for website
WORKDIR /app/packages/website

# Build your code
RUN pnpm run build

# Start your app
CMD ["pnpm", "start"]




