# Base image
FROM node:18-alpine

# Làm việc trong thư mục server
WORKDIR /app

# Copy package và cài dependencies
COPY package*.json ./
RUN npm ci

# Copy toàn bộ code backend
COPY . .

# Build TypeScript sang JS (nếu dùng TypeScript)
RUN npm run build

# Expose port cho backend
EXPOSE 8080

# Chạy ứng dụng (từ thư mục dist hoặc build)
CMD ["npm", "run", "start"]
