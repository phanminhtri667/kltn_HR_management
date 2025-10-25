# ---------- Build Stage ----------
    FROM node:18-alpine AS builder
    WORKDIR /app
    
    COPY package*.json ./
    RUN npm ci
    
    # copy toàn bộ code (bao gồm index.ts và tsconfig.json)
    COPY . .
    
    # Build TypeScript -> build/
    RUN npm run build
    
    # ---------- Runtime Stage ----------
    FROM node:18-alpine
    WORKDIR /app
    ENV NODE_ENV=production
    
    # chỉ cài dependencies cần thiết cho runtime
    COPY package*.json ./
    RUN npm ci --omit=dev
    
    # copy file build từ stage trước
    COPY --from=builder /app/build ./build
    COPY --from=builder /app/.env ./  # nếu bạn có file .env
    COPY --from=builder /app/config ./config  # nếu có config
    
    EXPOSE 3000
    CMD ["node", "build/index.js"]
    