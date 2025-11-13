# Base image
FROM node:18-alpine

WORKDIR /app

# Copy package và cài dependencies
COPY package*.json ./
RUN npm ci

# Copy toàn bộ source code
COPY . .

# Build TypeScript sang JS
RUN npm run build

# Xóa bớt source TypeScript (giảm dung lượng image, tránh nhầm)
RUN rm -rf src tsconfig.json

# Expose port
EXPOSE 8080

# ✅ Chạy file đã build
CMD ["node", "dist/index.js"]
