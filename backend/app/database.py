from contextlib import asynccontextmanager
from typing import AsyncIterator

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

CREATE_DOCUMENTS_TABLE = """
CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    doc_type TEXT NOT NULL,
    doc_name TEXT NOT NULL,
    fields_json TEXT NOT NULL DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
)
"""


async def init_db() -> None:
    async with aiosqlite.connect(DATABASE_PATH) as db:
        await db.execute(CREATE_USERS_TABLE)
        await db.execute(CREATE_DOCUMENTS_TABLE)
        await db.commit()


@asynccontextmanager
async def get_db() -> AsyncIterator[aiosqlite.Connection]:
    async with aiosqlite.connect(DATABASE_PATH) as db:
        yield db
