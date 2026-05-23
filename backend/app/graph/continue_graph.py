from langgraph.graph import StateGraph, END

from app.graph.state import InterviewState

from app.graph.nodes import (
    planner_node,
    technical_question_node,
    hr_question_node,
    evaluation_node,
    decision_node
)

builder = StateGraph(InterviewState)

builder.add_node(
    "evaluation",
    evaluation_node
)

builder.add_node(
    "decision",
    decision_node
)

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

builder.set_entry_point("evaluation")

builder.add_edge(
    "evaluation",
    "decision"
)

def continue_or_end(state: InterviewState):

    if state["interview_complete"]:
        return END

    return "planner"

builder.add_conditional_edges(
    "decision",
    continue_or_end
)

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

continue_graph = builder.compile()