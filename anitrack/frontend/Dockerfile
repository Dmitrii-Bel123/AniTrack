# ── Стадия 1: Build ──────────────────────────────────────────────
#берём готовый контейнер с node на основе alpine
FROM node:22-alpine as builder
# Создаем рабочий каталог
WORKDIR /app
# Копируем json файлы в эту директорию
COPY package*.json ./
# Устанавливаем все пакеты и зависимости
RUN npm install

COPY . .
RUN npm run build

# ── Стадия 2: Production ─────────────────────────────────────────

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

# Без multi-stage build образ весил бы ~1GB (Node + все node_modules). С ним — ~50MB.


