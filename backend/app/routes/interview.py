from fastapi import APIRouter
from app.graph.interview_graph import graph
from app.models.interview_models import InterviewRequest
from app.services.interview_service import generate_question
from app.graph.continue_graph import continue_graph
import uuid

from app.graph.interview_graph import graph

from app.services.session_store import sessions

router = APIRouter()

@router.post("/start")
async def start_interview(data: InterviewRequest):
    try:
        result = await graph.ainvoke({
            "role": data.role,
            "difficulty": data.difficulty,
            "skills": data.skills,
            "resume_path": data.resume_path,
            "history": [],
            "question_count": 0,
            "interview_complete": False
})

        session_id = str(uuid.uuid4())

        sessions[session_id] = result

        return {
            "session_id": session_id,
            "question": result.get("current_question", ""),
            "question_type": result.get("question_type", "technical")
        }
    except Exception as e:
        return {"error": str(e)}

from app.models.interview_models import EvaluationRequest
from app.services.interview_service import evaluate_answer

@router.post("/evaluate")
async def evaluate(data: EvaluationRequest):
    try:
        if data.session_id not in sessions:
            return {"error": "Session not found or expired. Please restart the interview."}

        session = sessions[data.session_id]
        current_q_type = session.get("question_type", "technical")

        session["answer"] = data.answer

        result = await continue_graph.ainvoke(session)

        sessions[data.session_id] = result

        return {
            "score": result.get("score", 0),
            "feedback": result.get("feedback", ""),
            "follow_up_question": result.get("current_question", ""),
            "question_count": result.get("question_count", 0),
            "interview_complete": result.get("interview_complete", False),
            "current_question_type": current_q_type,
            "next_question_type": result.get("question_type", "technical")
        }
    except Exception as e:
        return {"error": str(e)}