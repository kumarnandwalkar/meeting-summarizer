FROM node:20-alpine

WORKDIR /app

# Copy package files for server and client
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Install server and client dependencies
RUN npm --prefix server install
RUN npm --prefix client install

# Copy all source code
COPY . .

# Expose ports for backend and frontend
EXPOSE 3000 5173

# Start both backend and frontend
CMD ["npx", "concurrently", "npm --prefix server run dev", "npm --prefix client run dev"]