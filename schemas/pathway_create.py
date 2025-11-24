import uuid

from pydantic import BaseModel
from typing import List, Optional
from .topic_create import *
from datetime import datetime

class PathwayCreate(BaseModel):
    name: str
    topics: List[TopicCreate]

class PathwayResponse(BaseModel):
    id: uuid.UUID
    name: str
    topics: List[TopicResponse]
    created: datetime

    class Config:
        orm_mode = True