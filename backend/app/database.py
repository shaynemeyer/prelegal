import aiosqlite

from app.config import DATABASE_PATH

CREATE_USERS_TABLE = """
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
"""


async def init_db() -> None:
    async with aiosqlite.connect(DATABASE_PATH) as db:
        await db.execute(CREATE_USERS_TABLE)
        await db.commit()


async def get_db() -> aiosqlite.Connection:
    return await aiosqlite.connect(DATABASE_PATH)
