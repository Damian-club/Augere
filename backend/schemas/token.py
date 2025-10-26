from pydantic import BaseModel


class Token(BaseModel):
    access_token: str
    Token_type: str
    
class TokenData(BaseModel):
    email: str | None = None