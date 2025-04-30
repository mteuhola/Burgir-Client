FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:stable-alpine

RUN rm -rf /usr/share/nginx/html/*

COPY --from=builder /app/dist /usr/share/nginx/html

RUN adduser -D -g 'nginx' nginxuser && \
    chown -R nginxuser:nginx /usr/share/nginx/html

USER nginxuser

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
