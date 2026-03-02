import aiosqlite
import pytest


@pytest.mark.asyncio
async def test_init_db_creates_users_table(tmp_path, monkeypatch):
    db_path = str(tmp_path / "test.db")
    monkeypatch.setattr("app.database.DATABASE_PATH", db_path)

    from app.database import init_db

    await init_db()

    async with aiosqlite.connect(db_path) as db:
        cursor = await db.execute(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='users'"
        )
        row = await cursor.fetchone()

    assert row is not None
    assert row[0] == "users"


@pytest.mark.asyncio
async def test_init_db_creates_correct_columns(tmp_path, monkeypatch):
    db_path = str(tmp_path / "test.db")
    monkeypatch.setattr("app.database.DATABASE_PATH", db_path)

    from app.database import init_db

    await init_db()

    async with aiosqlite.connect(db_path) as db:
        cursor = await db.execute("PRAGMA table_info(users)")
        columns = {row[1] for row in await cursor.fetchall()}

    assert {"id", "email", "password_hash", "created_at"}.issubset(columns)


@pytest.mark.asyncio
async def test_init_db_creates_documents_table(tmp_path, monkeypatch):
    db_path = str(tmp_path / "test.db")
    monkeypatch.setattr("app.database.DATABASE_PATH", db_path)

    from app.database import init_db

    await init_db()

    async with aiosqlite.connect(db_path) as db:
        cursor = await db.execute("PRAGMA table_info(documents)")
        columns = {row[1] for row in await cursor.fetchall()}

    assert {"id", "user_id", "doc_type", "doc_name", "fields_json", "created_at"}.issubset(columns)


@pytest.mark.asyncio
async def test_init_db_is_idempotent(tmp_path, monkeypatch):
    db_path = str(tmp_path / "test.db")
    monkeypatch.setattr("app.database.DATABASE_PATH", db_path)

    from app.database import init_db

    await init_db()
    await init_db()  # should not raise
