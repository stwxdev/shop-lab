# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install bun using official installer
RUN apk add --no-cache curl unzip bash && \
    curl -fsSL https://bun.sh/install | bash && \
    ln -s /root/.bun/bin/bun /usr/local/bin/bun && \
    ln -s /root/.bun/bin/bunx /usr/local/bin/bunx

# Copy package files
COPY package.json bun.lock* package-lock.json* ./

# Install dependencies
RUN bun install --frozen-lockfile || npm ci

# Copy prisma schema
COPY prisma ./prisma

# Generate Prisma client
RUN bunx prisma generate || npx prisma generate

# Copy application files
COPY . .

# Build the application
RUN bun run build || npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Install bun using official installer (for production)
RUN apk add --no-cache curl unzip bash && \
    curl -fsSL https://bun.sh/install | bash && \
    ln -s /root/.bun/bin/bun /usr/local/bin/bun && \
    ln -s /root/.bun/bin/bunx /usr/local/bin/bunx

# Install production dependencies
COPY package.json bun.lock* package-lock.json* ./
RUN bun install --frozen-lockfile --production || npm ci --only=production

# Install Prisma CLI
RUN npm install -g prisma@latest

# Copy Prisma files and generate client
COPY prisma ./prisma
RUN bunx prisma generate || prisma generate

# Copy built application from builder
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/.nuxt ./.nuxt

# Copy entrypoint script
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Set environment variables
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

# Expose port
EXPOSE 3000

# Use entrypoint for migrations
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

# Start the application
CMD ["node", ".output/server/index.mjs"]
