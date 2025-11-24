from pydantic import BaseModel
from typing import List, Optional
from models.enums import Status

class TopicCreate(BaseModel):
    name: str
    order_number: int
    keywords: Optional[List[str]] = []
    status: Optional[Status] = Status.PENDING

class TopicResponse(BaseModel):
    id: int
    name: str
    order_number: int
    status: Status
    keywords: List[str]

    class Config:
        from_attributes = True