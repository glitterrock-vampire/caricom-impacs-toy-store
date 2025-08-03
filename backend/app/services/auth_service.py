# app/services/auth_service.py
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models import User
from app.utils.security import verify_password, create_access_token
from app.schemas import UserLogin, Token  # Changed UserResponse to Token

def authenticate_user(db: Session, login_data: UserLogin) -> Token:
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    access_token = create_access_token(
        subject=str(user.id),
        is_admin=user.is_admin
    )
    return Token(access_token=access_token, token_type="bearer")