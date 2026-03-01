from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr

from app.auth import create_access_token, hash_password, verify_password
from app.database import get_db

router = APIRouter(prefix="/api/auth", tags=["auth"])


class SignupRequest(BaseModel):
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def signup(body: SignupRequest) -> TokenResponse:
    async with get_db() as db:
        row = await db.execute("SELECT id FROM users WHERE email = ?", (body.email,))
        if await row.fetchone():
            raise HTTPException(status_code=400, detail="Email already registered")

        password_hash = hash_password(body.password)
        cursor = await db.execute(
            "INSERT INTO users (email, password_hash) VALUES (?, ?)",
            (body.email, password_hash),
        )
        await db.commit()
        user_id = cursor.lastrowid

    token = create_access_token(user_id=user_id, email=body.email)
    return TokenResponse(access_token=token)


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest) -> TokenResponse:
    async with get_db() as db:
        row = await db.execute(
            "SELECT id, password_hash FROM users WHERE email = ?", (body.email,)
        )
        user = await row.fetchone()

    if not user or not verify_password(body.password, user[1]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(user_id=user[0], email=body.email)
    return TokenResponse(access_token=token)
