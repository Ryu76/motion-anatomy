import pytest
from sqlalchemy.engine import make_url

from motion_anatomy_api.db import get_database_url
from motion_anatomy_api.main import get_cors_origins


def test_cors_origins_can_be_configured(monkeypatch):
    monkeypatch.setenv(
        "CORS_ALLOWED_ORIGINS",
        "https://motion.example, https://admin.example,https://motion.example",
    )
    assert get_cors_origins() == ["https://motion.example", "https://admin.example"]


def test_database_url_safely_encodes_special_password(monkeypatch):
    monkeypatch.delenv("DATABASE_URL", raising=False)
    monkeypatch.setenv("POSTGRES_USER", "motion@example")
    monkeypatch.setenv("POSTGRES_PASSWORD", "p@ss:/word#safe")
    monkeypatch.setenv("DB_HOST", "db")
    monkeypatch.setenv("DB_PORT", "5432")
    monkeypatch.setenv("POSTGRES_DB", "motion_anatomy")

    parsed = make_url(get_database_url())
    assert parsed.username == "motion@example"
    assert parsed.password == "p@ss:/word#safe"
    assert parsed.host == "db"


def test_database_url_requires_password_without_full_url(monkeypatch):
    monkeypatch.delenv("DATABASE_URL", raising=False)
    monkeypatch.delenv("POSTGRES_PASSWORD", raising=False)
    with pytest.raises(RuntimeError, match="POSTGRES_PASSWORD"):
        get_database_url()
