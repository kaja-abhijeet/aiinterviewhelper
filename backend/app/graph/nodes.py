from app.graph.state import InterviewState
from app.services.interview_service import llm
from app.prompts.interview_prompts import QUESTION_PROMPT
from app.rag.retriever import retrieve_context
async def question_generator_node(state: InterviewState):

    prompt = QUESTION_PROMPT.format(
        role=state["role"],
        difficulty=state["difficulty"],
        skills=", ".join(state["skills"])
    )

    response = await llm.ainvoke(prompt)

    return {
        "current_question": response.content
    }

from app.prompts.interview_prompts import EVALUATION_PROMPT
import json

async def evaluation_node(state: InterviewState):

    prompt = EVALUATION_PROMPT.format(
        question=state["current_question"],
        answer=state["answer"]
    )

    response = await llm.ainvoke(prompt)

    parsed = json.loads(response.content)

    updated_count = state["question_count"] + 1

    updated_history = state["history"] + [
        {
            "question": state["current_question"],
            "answer": state["answer"],
            "score": parsed["score"]
        }
    ]

    return {
        "score": parsed["score"],
        "feedback": parsed["feedback"],
        "follow_up_question": parsed["follow_up_question"],
        "question_count": updated_count,
        "history": updated_history
        }

async def decision_node(state: InterviewState):

    if state["question_count"] >= 5:

        return {
            "interview_complete": True
        }

    return {
        "interview_complete": False
    }

from app.prompts.interview_prompts import PLANNER_PROMPT

async def planner_node(state: InterviewState):

    prompt = PLANNER_PROMPT.format(
        question_count=state["question_count"]
    )

    response = await llm.ainvoke(prompt)

    question_type = response.content.strip().lower()

    return {
        "question_type": question_type
    }

from app.prompts.interview_prompts import (
    TECHNICAL_QUESTION_PROMPT
)

async def technical_question_node(state: InterviewState):

    prompt = TECHNICAL_QUESTION_PROMPT.format(
        role=state["role"],
        difficulty=state["difficulty"],
        skills=", ".join(state["skills"]),
        resume_context=state["resume_context"]
    )

    response = await llm.ainvoke(prompt)

    return {
        "current_question": response.content
    }

from app.prompts.interview_prompts import (
    HR_QUESTION_PROMPT
)

async def hr_question_node(state: InterviewState):

    prompt = HR_QUESTION_PROMPT.format(
        role=state["role"]
    )

    response = await llm.ainvoke(prompt)

    return {
        "current_question": response.content
    }

from app.prompts.interview_prompts import FINAL_FEEDBACK_PROMPT

async def feedback_node(state: InterviewState):

    prompt = FINAL_FEEDBACK_PROMPT.format(
        history=state["history"]
    )

    response = await llm.ainvoke(prompt)

    return {
        "final_feedback": response.content
    }

async def resume_retriever_node(state: InterviewState):

    results = retrieve_context(
        file_path=state["resume_path"],
        query=f"{state['role']} interview questions"
    )

    context = "\n".join([
        doc.page_content for doc in results[:3]
    ])

    return {
        "resume_context": context
    }