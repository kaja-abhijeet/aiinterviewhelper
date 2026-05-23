from langgraph.graph import StateGraph, END

from app.graph.state import InterviewState

from app.graph.nodes import (
    planner_node,
    technical_question_node,
    hr_question_node,
    resume_retriever_node
)

builder = StateGraph(InterviewState)

builder.add_node(
    "planner",
    planner_node
)

builder.add_node(
    "technical",
    technical_question_node
)

builder.add_node(
    "hr",
    hr_question_node
)

builder.set_entry_point("resume_retriever")

def route_question(state: InterviewState):

    if state["question_type"] == "technical":
        return "technical"

    return "hr"

builder.add_conditional_edges(
    "planner",
    route_question
)

builder.add_edge(
    "technical",
    END
)

builder.add_edge(
    "hr",
    END
)

builder.add_node(
    "resume_retriever",
    resume_retriever_node
)

builder.add_edge(
    "resume_retriever",
    "planner"
)

graph = builder.compile()