# Единственная стадия — сборка. Nginx-образ не нужен:
# dist передаётся через named volume, а не через COPY.
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --prefer-offline

COPY . .
RUN npm run build

# Контейнер после сборки завершается — это нормально.
# Docker Compose наполняет volume /app/dist и отдаёт его nginx.


