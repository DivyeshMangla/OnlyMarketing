# --- Stage 1: Build Frontend ---
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
ENV VITE_API_BASE=/api
RUN npm run build

# --- Stage 2: Build Backend ---
FROM node:20-alpine AS backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend/ .
RUN npm run build

# --- Stage 3: Final Production Image ---
FROM node:20-alpine
WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Copy backend dependencies
COPY backend/package*.json ./
RUN npm install --omit=dev

# Copy compiled backend from Stage 2
COPY --from=backend-builder /app/backend/dist ./dist

# Copy compiled frontend from Stage 1 into the public folder
COPY --from=frontend-builder /app/frontend/dist ./public

EXPOSE 5000

# Start the monolith from the root /app directory
# process.cwd() will be /app, so path.join(process.cwd(), 'public') will find /app/public
CMD ["node", "--max-old-space-size=400", "dist/server.js"]
