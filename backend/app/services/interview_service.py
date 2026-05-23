from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate
from app.prompts.interview_prompts import QUESTION_PROMPT
import os
import json
from dotenv import load_dotenv

load_dotenv()

llm = ChatOpenAI(
    model="gpt-4o-mini",
    api_key=os.getenv("OPENAI_API_KEY")
)

prompt_template = PromptTemplate(
    input_variables=["role", "difficulty", "skills"],
    template=QUESTION_PROMPT
)

async def generate_question(data):

    prompt = prompt_template.format(
        role=data.role,
        difficulty=data.difficulty,
        skills=", ".join(data.skills)
    )

    response = await llm.ainvoke(prompt)

    return response.content

from app.prompts.interview_prompts import EVALUATION_PROMPT

evaluation_template = PromptTemplate(
    input_variables=["question", "answer"],
    template=EVALUATION_PROMPT
)

async def evaluate_answer(data):

    prompt = evaluation_template.format(
        question=data.question,
        answer=data.answer
    )

    response = await llm.ainvoke(prompt)

    parsed_response = json.loads(response.content)

    return parsed_response