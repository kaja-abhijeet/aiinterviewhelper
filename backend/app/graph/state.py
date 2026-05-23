from typing import TypedDict, List

class InterviewState(TypedDict):

    role: str
    difficulty: str
    skills: List[str]

    current_question: str

    answer: str

    score: int

    feedback: str

    follow_up_question: str

    question_count: int

    interview_complete: bool

    history: List[dict]

    question_type: str

    final_feedback: str

    resume_path: str

    resume_context: str