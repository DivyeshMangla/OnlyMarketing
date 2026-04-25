# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first for better caching
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

# Stage 2: Production Runtime
FROM node:20-alpine AS runner

WORKDIR /app

# Set environment to production
ENV NODE_ENV=production

# Install only production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy built files from builder
COPY --from=builder /app/dist ./dist

EXPOSE 5000

# Run the compiled server with a heap limit to keep GC aggressive
CMD ["node", "--max-old-space-size=300", "dist/server.js"]
