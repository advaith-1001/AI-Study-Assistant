from pydantic import BaseModel
from typing import List
from .topic_create import TopicResponse

class PathwayStatusResponse(BaseModel):
    total_topics: int
    completed_topics_count: int
    pending_topics_count: int
    completion_percentage: float
    completed_topics: List[TopicResponse]