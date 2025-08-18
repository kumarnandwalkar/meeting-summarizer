# ---- Stage 1: Build ----
FROM node:20-alpine AS builder
WORKDIR /app

# Install server dependencies
COPY server/package*.json ./server/
RUN npm --prefix server install --legacy-peer-deps

# Install client dependencies
COPY client/package*.json ./client/
RUN npm --prefix client install --legacy-peer-deps

# Copy full project
COPY . .

# Build client (React)
RUN npm --prefix client run build

# ---- Stage 2: Runtime ----
FROM node:20-alpine
WORKDIR /app

# Copy only necessary files from builder
COPY --from=builder /app/server ./server
COPY --from=builder /app/client/build ./client/build

# Expose backend port
EXPOSE 8080

# Start backend
CMD ["npm", "--prefix", "server", "start"]
