from pydantic import BaseModel
import uuid
from typing import List, Optional

class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = [] # Default to empty list if not provided

class ChatResponse(BaseModel):
    answer: str
    pathway_id: uuid.UUID