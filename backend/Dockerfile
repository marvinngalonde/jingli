# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./

# Install dependencies (including devDependencies for build)
RUN npm ci

# Copy Prisma schema and generate client
# We do this before copying all source code to leverage Docker cache
COPY prisma ./prisma/
RUN npx prisma@5.22.0 generate

# Copy source code
COPY src ./src/

# Build the NestJS application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy Prisma schema and generate client for production
COPY prisma ./prisma/
# Need to regenerate the client in the production image so it works with the current OS/architecture
RUN npx prisma@5.22.0 generate

# Copy built assets from builder stage
COPY --from=builder /app/dist ./dist

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start:prod"]
