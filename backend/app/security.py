from datetime import datetime, timedelta
from jose import jwt, JWTError

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from .database import get_db
from . import models


SECRET_KEY = "destek_sistemi_gizli_anahtar"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60


def create_access_token(data: dict):

    to_encode = data.copy()

    expire = datetime.utcnow() + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    to_encode.update({"exp": expire})

    return jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )


security = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):

    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Oturum açmanız gerekiyor."
        )

    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        kullanici_id = payload.get("sub")

        if kullanici_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Geçersiz token."
            )

        kullanici_id = int(kullanici_id)

    except (JWTError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Geçersiz veya süresi dolmuş oturum."
        )

    kullanici = (
        db.query(models.Kullanicilar)
        .filter(
            models.Kullanicilar.kullanici_id == kullanici_id
        )
        .first()
    )

    if kullanici is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Kullanıcı bulunamadı."
        )

    return kullanici


def require_roles(*allowed_roles):

    def role_checker(
        current_user: models.Kullanicilar = Depends(get_current_user)
    ):

        if current_user.rol not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Bu işlem için yetkiniz bulunmuyor."
            )

        return current_user

    return role_checker