import logging
import os
from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import CORS_ORIGINS, JWT_SECRET_KEY, LOG_LEVEL
from app.database import init_db
from app.logger import configure_logging
from app.routes import auth, chat, health, nda, root

configure_logging(log_level=LOG_LEVEL)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    if JWT_SECRET_KEY == "change-me-in-production":
        logger.warning("JWT_SECRET_KEY is set to the default insecure value. Set a strong secret in production.")
    await init_db()
    yield


app = FastAPI(title="Prelegal API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(root.router)
app.include_router(health.router)
app.include_router(nda.router)
app.include_router(auth.router)
app.include_router(chat.router)

# Serve static frontend files if the directory exists (Docker production)
_static_dir = os.path.join(os.path.dirname(__file__), "..", "static")
if os.path.isdir(_static_dir):
    app.mount("/", StaticFiles(directory=_static_dir, html=True), name="static")
