import os
from dotenv import load_dotenv

load_dotenv()

LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
TEMPLATES_DIR = os.getenv("TEMPLATES_DIR", "../templates")
