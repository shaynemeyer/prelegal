from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import CORS_ORIGINS, LOG_LEVEL
from app.logger import configure_logging
from app.routes import health, nda, root

configure_logging(log_level=LOG_LEVEL)

app = FastAPI(title="Prelegal API", version="0.1.0")

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
