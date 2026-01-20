FROM node:16.13-alpine AS node

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM nginx:latest
COPY --from=node /app/dist/* /usr/share/nginx/html/
COPY /nginx.conf  /etc/nginx/conf.d/default.conf
EXPOSE 80
