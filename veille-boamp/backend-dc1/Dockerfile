# =============================================
# TenderSpotter Backend - Dockerfile
# NestJS with PostgreSQL
# =============================================

# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Install production dependencies only
COPY package.json package-lock.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built application
COPY --from=builder /app/dist ./dist

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Create data directory for temp files
RUN mkdir -p /app/data && chown -R nestjs:nodejs /app/data

USER nestjs

EXPOSE 3001

ENV PORT=3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

CMD ["node", "dist/main.js"]
