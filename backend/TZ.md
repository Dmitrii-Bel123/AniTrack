# AniTrack

AniTrack — сервис для персонального отслеживания просмотра аниме.
Пользователь ведёт собственную коллекцию, синхронизированную с внешними данными через Jikan API, без локального хранения каталога аниме.

---

## О проекте

Система позволяет:

* искать аниме через внешний API
* добавлять их в личную коллекцию
* отслеживать статус просмотра
* ставить оценки и оставлять заметки
* получать статистику по просмотрам

Каждый пользователь работает только со своей приватной коллекцией.

---

## Архитектура

Проект разделён на backend и frontend:

* Backend: Django + DRF + JWT + PostgreSQL
* Frontend: React (Vite, TypeScript)
* Внешние данные: Jikan API (MyAnimeList)

Контейнеризация: Docker + Docker Compose
Reverse proxy: Nginx (frontend build)

---

## Основные возможности

### Пользователи

* регистрация и авторизация через JWT
* обновление токена
* выход с blacklist refresh-токена
* профиль пользователя
* смена пароля

---

### Поиск аниме

Данные не хранятся локально.

* запрос → Jikan API
* результат возвращается без записи в БД
* при добавлении в коллекцию данные кешируются в `Anime`

---

### Личная коллекция

Каждое аниме в списке пользователя содержит:

* статус: `Хочу посмотреть / Смотрю / Посмотрел / Дропнул`
* оценку (1–10)
* заметку пользователя
* дату начала и завершения просмотра

Доступно:

* добавление
* обновление
* удаление
* фильтрация по статусу
* сортировка по оценке и дате добавления

---

### Статистика

Пользователь получает агрегированную информацию:

* количество аниме по статусам
* средняя оценка
* общее количество просмотренных эпизодов

---

## API (Auth)

| Method      | Endpoint                     | Description              | Auth |
| ----------- | ---------------------------- | ------------------------ | ---- |
| POST        | `/api/auth/register/`        | регистрация              | нет  |
| POST        | `/api/auth/login/`           | получение JWT            | нет  |
| POST        | `/api/auth/token/refresh/`   | обновление access токена | нет  |
| POST        | `/api/auth/logout/`          | blacklist refresh токена | да   |
| GET / PATCH | `/api/auth/me/`              | профиль пользователя     | да   |
| POST        | `/api/auth/change_password/` | смена пароля             | да   |

---

## API (Anime)

### Поиск

* `GET /api/anime/{mal_id}/`
* `GET /api/anime/?search=naruto`

Поиск проксируется в Jikan API, данные не сохраняются.

---

### Пользовательская коллекция

* `GET /api/anime/my/`
* `GET /api/anime/user/?status=PR`
* `GET /api/anime/my/{id}/`
* `PATCH /api/anime/my/{id}/`
* `DELETE /api/anime/my/{id}/`
* `POST /api/anime/my/add/`

---

## Логика добавления

При добавлении аниме:

1. клиент отправляет `mal_id` и статус
2. сервер проверяет наличие `Anime` в БД
3. если нет — запрашивает Jikan API и сохраняет
4. создаётся `UserAnime` запись для пользователя

---

## Модели

### User

* avatar

### Anime

* mal_id
* title
* genres (FK Genre)
* poster
* episodes

### Genre

* title

### UserAnime

* user (FK User)
* anime (FK Anime)
* user_note
* user_rate
* user_fav_character
* user_status
* started_at
* finished_at
* created_at
* updated_at

---

## Frontend

Инициализация:

```bash
npm create vite@latest frontend -- --template react-ts
```

Зависимости:

* axios — работа с API
* react-router-dom — маршрутизация
* @tabler/icons-react — иконки

---

Сборка:

```bash
npm run build
```

---

## Docker

Запуск frontend:

```bash
docker run --rm -it \
  -v ${PWD}/frontend:/app \
  -w /app \
  node:22 \
  npm install
```

Сборка и перезапуск:

```bash
docker run --rm -it \
  -v ${PWD}/frontend:/app \
  -w /app \
  node:22 \
  npm run build && docker-compose restart nginx
```
