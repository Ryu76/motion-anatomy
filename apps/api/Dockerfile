FROM python:3.12-slim
WORKDIR /app

COPY apps/api/pyproject.toml apps/api/uv.lock ./
RUN pip install --no-cache-dir uv==0.11.19 && uv sync --frozen --no-dev

COPY apps/api/src ./src
COPY apps/api/alembic.ini ./alembic.ini
COPY apps/api/alembic ./alembic
COPY data/seed /data/seed

RUN useradd --create-home --uid 10001 appuser && chown -R appuser:appuser /app

ENV PYTHONPATH=/app/src \
    ANATOMY_SEED_PATH=/data/seed/anatomy_structures.json \
    UV_CACHE_DIR=/tmp/uv-cache

USER appuser

CMD ["sh", "-c", "uv run alembic upgrade head && exec uv run uvicorn motion_anatomy_api.main:app --host 0.0.0.0 --port 8000"]
