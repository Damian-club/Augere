from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    DB_CONN: str
    SECRET_KEY: str
    OPENAI_KEY: str

    ACCESS_TOKEN_EXPIRE_MINUTES: int = 525600
    ALGORITHM: str = "HS256"

    class Config:
        env_file: str = ".env"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
