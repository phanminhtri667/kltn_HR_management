# ===============================
# Stage 1: Build TypeScript
# ===============================
FROM node:18-alpine AS build
WORKDIR /app

# Copy package và cài đặt dependencies
COPY package*.json ./
RUN npm ci

# Copy toàn bộ code
COPY . .

# Build TypeScript -> dist
RUN npx tsc

# ===============================
# Stage 2: Production runtime
# ===============================
FROM node:18-alpine
WORKDIR /app

# Copy dist và package.json từ stage build
COPY --from=build /app/dist ./dist
COPY package*.json ./

# Cài dependencies runtime (omit dev)
RUN npm ci --omit=dev

EXPOSE 8080

# ✅ Run file build sẵn, không chạy ts-node
CMD ["node", "dist/index.js"]
