 # Stage 1: Build React app
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

RUN echo "Building with API URL = $REACT_APP_API_URL"
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:1.25-alpine

# Xoá config default (tuỳ chọn, nhưng nên làm)
RUN rm /etc/nginx/conf.d/default.conf

# Copy build React
COPY --from=builder /app/build /usr/share/nginx/html

# Copy config Nginx mới
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
