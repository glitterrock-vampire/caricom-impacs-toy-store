# In app/config.py
from pydantic_settings import BaseSettings
from pydantic import AnyHttpUrl, field_validator
from typing import List, Union
import os
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "Toy Store Management System"
    SQLALCHEMY_DATABASE_URI: str = os.getenv("DATABASE_URL")

    # CORS settings
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",  # Frontend URL
        "http://localhost:8000",  # Backend URL (if needed for docs)
    ]

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str):
            if v.startswith("["):
                import json
                v = json.loads(v)
            else:
                v = [i.strip() for i in v.split(",")]
        return v

    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-key-change-in-production")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # API settings
    API_V1_STR: str = "/api"
    PROJECT_VERSION: str = "1.0.0"

    # Alias for backward compatibility
    CORS_ORIGINS: List[str] = BACKEND_CORS_ORIGINS

settings = Settings()