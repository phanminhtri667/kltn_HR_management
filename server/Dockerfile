FROM node:18-alpine AS builder
WORKDIR /app

# Copy & cài dependencies
COPY package*.json ./
RUN npm ci

# Copy toàn bộ mã nguồn (bao gồm index.ts và src/)
COPY . .

# Build TypeScript -> dist/
RUN npm run build

# ----- Runtime Stage -----
FROM node:18-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/index.js"]
