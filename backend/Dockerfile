# Backend Dockerfile
FROM node:18-alpine

# Install wget for health checks
RUN apk add --no-cache wget

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm install

# Copy Prisma schema
COPY prisma ./prisma

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Create directory for SQLite database
RUN mkdir -p /app/data

# Expose port
EXPOSE 3001

# Run migrations and start the app
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
