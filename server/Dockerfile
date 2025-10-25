# ---------- Build Stage ----------
    FROM node:18-alpine AS builder
    WORKDIR /app
    
    COPY package*.json ./
    RUN npm ci
    
    COPY . .
    RUN npm run build
    
    # ---------- Runtime Stage ----------
    FROM node:18-alpine
    WORKDIR /app
    ENV NODE_ENV=production
    
    COPY package*.json ./
    RUN npm ci --omit=dev
    
    # Copy output build từ stage trước
    COPY --from=builder /app/build ./build
    
    # Nếu bạn KHÔNG có file .env hay folder config trong repo, comment 2 dòng sau
    # COPY --from=builder /app/.env ./
    # COPY --from=builder /app/config ./config
    
    EXPOSE 3000
    CMD ["node", "build/index.js"]
    