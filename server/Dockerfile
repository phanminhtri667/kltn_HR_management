# ===============================
# Stage 1: Build
# ===============================
FROM node:18-alpine AS build

WORKDIR /app

# Cài dependencies
COPY package*.json ./
RUN npm ci

# Copy toàn bộ source code
COPY . .

# Build TypeScript sang dist
RUN npx tsc || (npm install -g typescript && npx tsc)

# ===============================
# Stage 2: Production
# ===============================
FROM node:18-alpine

WORKDIR /app

# Copy dist và package.json từ build stage
COPY --from=build /app/dist ./dist
COPY package*.json ./

# Cài production dependencies
RUN npm ci --omit=dev

EXPOSE 8080

# Chạy server
CMD ["node", "dist/index.js"]
