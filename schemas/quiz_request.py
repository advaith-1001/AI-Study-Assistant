from pydantic import BaseModel, Field
from typing import Optional, Literal


class QuizRequest(BaseModel):
    topic_id: int
    difficulty: Literal["easy", "medium", "hard"] = "medium"
    num_questions: int = Field(default=5, ge=1, le=20)


