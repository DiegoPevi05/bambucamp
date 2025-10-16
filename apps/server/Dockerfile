FROM node:18-alpine

WORKDIR /app

# Install OpenSSL and other dependencies for Prisma
RUN apk add --no-cache openssl

# Install dependencies
COPY apps/server/package*.json ./
RUN npm ci

# Copy prisma schema
COPY apps/server/prisma ./prisma

# Copy source code
COPY apps/server/src ./src
COPY apps/server/tsconfig.json ./

# Create public/images directory
RUN mkdir -p ./public/images

# Generate Prisma client
RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "run", "dev"]
