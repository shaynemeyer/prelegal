import pytest
from jose import JWTError

from app.auth import (
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password,
)


def test_hash_password_returns_bcrypt_hash():
    hashed = hash_password("secret")
    assert hashed.startswith("$2b$")


def test_verify_password_correct():
    hashed = hash_password("secret")
    assert verify_password("secret", hashed) is True


def test_verify_password_wrong():
    hashed = hash_password("secret")
    assert verify_password("wrong", hashed) is False


def test_create_access_token_returns_string():
    token = create_access_token(user_id=1, email="user@example.com")
    assert isinstance(token, str)
    assert len(token) > 0


def test_decode_access_token_returns_correct_payload():
    token = create_access_token(user_id=42, email="user@example.com")
    payload = decode_access_token(token)
    assert payload["sub"] == "42"
    assert payload["email"] == "user@example.com"


def test_decode_access_token_raises_on_invalid():
    with pytest.raises(JWTError):
        decode_access_token("not.a.valid.token")


def test_decode_access_token_raises_on_tampered():
    token = create_access_token(user_id=1, email="user@example.com")
    tampered = token[:-4] + "XXXX"
    with pytest.raises(JWTError):
        decode_access_token(tampered)
