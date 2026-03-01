import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport


@pytest_asyncio.fixture
async def client(tmp_path, monkeypatch):
    """Test client with an isolated SQLite database."""
    db_path = str(tmp_path / "test.db")
    monkeypatch.setattr("app.database.DATABASE_PATH", db_path)

    from app.database import init_db
    from app.main import app

    await init_db()

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c
