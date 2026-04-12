from core.ai_client import ai_client, async_ai_client
from util.ai_agent import AIAgent

def get_ai_client():
    return AIAgent(ai_client, async_ai_client)
