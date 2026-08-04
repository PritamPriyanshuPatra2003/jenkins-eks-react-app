# Stage 1: Build React application
#-------------------------------------------------------
FROM node:24 AS builder

WORKDIR /app

COPY . .

RUN npm install

RUN npm run build

# Stage 2: Serve using Nginx
#--------------------------------------------------------

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
