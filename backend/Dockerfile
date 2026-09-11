FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    PYTHONPATH=/code

# Берём готовый бинарник uv, а не ставим его через pip
COPY --from=ghcr.io/astral-sh/uv:0.11.7 /uv /uvx /usr/local/bin/

WORKDIR /code

# Кладём только манифесты, чтобы слой с зависимостями кешировался
# отдельно от кода и не пересобирался на каждое изменение файлов проекта
COPY pyproject.toml uv.lock ./
RUN uv sync --locked --no-install-project --no-dev

COPY . .
RUN uv sync --locked --no-dev

# Дальше используем venv, который создал uv
ENV PATH="/code/.venv/bin:$PATH"
