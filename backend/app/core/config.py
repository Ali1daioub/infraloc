from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    APP_NAME: str = "InfraLoc"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = False

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://infraloc:infraloc@localhost:5432/infraloc"
    DATABASE_URL_SYNC: str = "postgresql+psycopg2://infraloc:infraloc@localhost:5432/infraloc"

    # Auth
    SECRET_KEY: str = "change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # S3 / File Storage
    S3_BUCKET: str = "infraloc-uploads"
    S3_REGION: str = "eu-central-1"
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    UPLOAD_DIR: str = "/tmp/infraloc-uploads"

    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "https://infraloc.vercel.app"]

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


@lru_cache
def get_settings() -> Settings:
    return Settings()
