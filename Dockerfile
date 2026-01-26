# ==============================================================================
# Multi-stage Dockerfile for Secure Guard
# ==============================================================================
# Optimized for CI/CD usage with minimal image size
# 
# Usage:
#   docker build -t secure-guard .
#   docker run --rm -v $(pwd):/workspace secure-guard scan -d /workspace
#
# Image size: ~150MB (Alpine-based Node.js)
# ==============================================================================

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /build

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY src ./src

# Build TypeScript
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

LABEL maintainer="your-email@example.com"
LABEL description="Secure Guard - Production configuration security scanner"
LABEL version="1.0.0"

WORKDIR /app

# Copy package files and install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev && \
    npm cache clean --force

# Copy compiled JavaScript from builder
COPY --from=builder /build/dist ./dist

# Create workspace directory for mounting
RUN mkdir -p /workspace
WORKDIR /workspace

# Run as non-root user for security
RUN addgroup -g 1000 scanner && \
    adduser -D -u 1000 -G scanner scanner && \
    chown -R scanner:scanner /app
USER scanner

# Set default entrypoint
ENTRYPOINT ["node", "/app/dist/cli/main.js"]

# Default command (can be overridden)
CMD ["scan", "--help"]

# Health check (for container orchestration)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node /app/dist/cli/main.js --version || exit 1
