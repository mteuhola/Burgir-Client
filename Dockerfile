FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:stable-alpine

ENV NGINX_TEMP_PATH=/tmp/nginx

RUN mkdir -p /tmp/nginx/client_temp \
    && chmod -R 777 /tmp/nginx \
    && mkdir -p /var/log/nginx \
    && chmod -R 777 /var/log/nginx

RUN rm -rf /usr/share/nginx/html/*

COPY --from=builder /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
