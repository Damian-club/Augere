from pydantic import BaseModel, Field
from schemas.ai_chat import AIChatOut

class SimplePrompt(BaseModel):
    prompt: str = Field(...)

class ContextPrompt(SimplePrompt):
    history: list[AIChatOut] = Field(...)
    context: str = Field(...)