from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.interview import router as interview_router
from app.routes.resume import router as resume_router

app = FastAPI()

# Allow frontend origin to access the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the actual frontend domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(interview_router)
app.include_router(resume_router)

@app.get("/")
async def home():
    return {"message": "AI Interview Simulator Backend"}