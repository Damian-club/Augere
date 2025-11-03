from openai import OpenAI
from functools import lru_cache
from core.settings import settings

@lru_cache
def get_ai_client() -> OpenAI:
    return OpenAI(
        api_key=settings.OPENAI_KEY
    )

ai_client: OpenAI = get_ai_client()