# Base image
FROM node:18-alpine

WORKDIR /app

# Copy package và cài dependencies
COPY package*.json ./
RUN npm ci

# Copy toàn bộ code backend
COPY . .

# Expose port cho backend
EXPOSE 8080

# Chạy ứng dụng bằng ts-node (TypeScript runtime)
CMD ["npx", "ts-node", "index.ts"]
