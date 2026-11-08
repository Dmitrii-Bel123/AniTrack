# AniTrack

Веб-приложение для ведения личного списка аниме. Помогает сохранять тайтлы, отмечать просмотренное, выставлять оценки и следить за статистикой.

## Возможности

- Регистрация, авторизация по JWT и редактирование профиля.
- Поиск аниме во внешнем каталоге и добавление в личный список.
- Статусы просмотра: запланировано, смотрю, просмотрено, брошено.
- Личные оценки, заметки, любимые персонажи и даты просмотра.
- Поиск, фильтрация и сортировка личной коллекции.
- Статистика по статусам, средней оценке и количеству просмотренных эпизодов.

## Стек

**Backend:** Python 3.13, Django, Django REST Framework, PostgreSQL 16, uv.

**Frontend:** React, TypeScript, Vite, Axios.

**Инфраструктура:** Docker Compose, Nginx, Gunicorn. Проверки — pytest, ESLint и GitHub Actions.

## Запуск

Требуются Docker и Docker Compose. Все команды выполняются из корня проекта.

```sh
cp .env.example .env
```

В `.env` задайте собственные `SECRET_KEY` и `PG_PASSWORD`. Остальные значения в примере подходят для запуска на `localhost`; `PG_HOST=anitrack_db` — имя сервиса базы данных внутри Docker.

```sh
docker compose -f docker-compose.yml up -d --build
```

При запуске автоматически выполняются миграции и сборка статики Django. Nginx отдаёт интерфейс и направляет запросы к API.

| Ресурс | Адрес |
| --- | --- |
| Приложение | http://localhost |
| Swagger UI | http://localhost/api/docs/ |
| OpenAPI | http://localhost/api/schema/ |
| Панель администратора | http://localhost/admin/ |

Для доступа к панели администратора создайте суперпользователя:

```sh
docker compose -f docker-compose.yml exec anitrack python manage.py createsuperuser
```

Поиск и загрузка данных об аниме требуют доступа к внешнему API. Его адрес задан в `backend/apps/main/services.py`.

Остановка приложения:

```sh
docker compose -f docker-compose.yml down
```

Данные PostgreSQL и загруженные файлы сохраняются в Docker volumes.

## Разработка и проверки

Для разработки backend используйте обычный запуск Compose:

```sh
docker compose up -d --build
```

Compose автоматически подключит `docker-compose.override.yml`: исходники backend будут смонтированы в контейнер, Django запустится с `DEBUG=True` и перезагрузкой при изменениях на порту `8000`.

Для разработки интерфейса нужен Node.js 22.13+ в ветке 22, используемой Docker-образом. В отдельном терминале запустите Vite:

```sh
cd frontend
npm ci
npm run dev
```

Интерфейс доступен по адресу http://localhost:5173. Запросы `/api` перенаправляются на Django по адресу `http://localhost:8000`.

Проверка Django и тесты при запущенном окружении разработки:

```sh
docker compose exec anitrack uv sync --locked
docker compose exec anitrack uv run python manage.py check
docker compose exec anitrack uv run pytest
```

Проверка и сборка интерфейса из каталога `frontend`:

```sh
npm run lint
npm run build
```

## Структура

| Путь | Содержимое |
| --- | --- |
| `backend/apps/main/` | Коллекция аниме, поиск, статистика и интеграция с каталогом |
| `backend/apps/users/` | Пользователи, авторизация и профиль |
| `backend/config/` | Настройки Django и маршруты API |
| `frontend/src/` | Страницы, компоненты, стили и API-клиент |
| `frontend/nginx/` | Раздача интерфейса и проксирование запросов |
| `.github/workflows/` | Автоматические проверки backend |
