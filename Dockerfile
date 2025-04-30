FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./

RUN npm install
RUN npm install react-router-dom axios framer-motion
RUN npm install -D tailwindcss postcss autoprefixer
RUN npx tailwindcss init -p

COPY . .

RUN npm run build

FROM node:18-alpine

WORKDIR /app

RUN npm install -g serve
COPY --from=builder /app/dist /app

EXPOSE 5173

# Start the server
CMD ["serve", "-s", ".", "-l", "5173"]
