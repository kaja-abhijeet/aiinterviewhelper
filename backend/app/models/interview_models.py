from pydantic import BaseModel
from typing import List

class InterviewRequest(BaseModel):
    role: str
    difficulty: str
    skills: List[str]
    resume_path: str

class EvaluationRequest(BaseModel):
    session_id: str
    answer: str

class EvaluationResponse(BaseModel):
    score: int
    feedback: str
    follow_up_question: str