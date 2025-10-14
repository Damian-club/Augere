from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    DB_CONN: str = 'sqlite:///./app.db'

    class Config:
        env_file: str = '.env'

@lru_cache
def get_settings() -> Settings:
    return Settings()

settings = get_settings()