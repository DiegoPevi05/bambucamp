FROM node:18-alpine

WORKDIR /app

# Install system dependencies for Prisma
RUN apk add --no-cache openssl

# Copy root package files (for build:shared)
COPY package*.json ./

# Copy server-specific files
COPY apps/server/package*.json ./apps/server/
RUN cd apps/server && npm ci

# Copy shared-types package and build it
COPY packages/shared-types ./packages/shared-types
RUN cd packages/shared-types && npx tsc

# Copy prisma schema
COPY apps/server/prisma ./apps/server/prisma

# Copy server source
COPY apps/server/src ./apps/server/src
COPY apps/server/tsconfig.json ./apps/server/

# Create public/images directory
RUN mkdir -p ./apps/server/public/images

WORKDIR /app/apps/server

# Generate Prisma client
RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "run", "dev"]
