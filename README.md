# ⚙️ AI Interview Simulator — Interviewer

An intelligent, state-of-the-art mock interview platform that simulates personalized, resume-aware technical and behavioral interviews. Powered by **FastAPI**, **Next.js**, **Tailwind CSS**, **LangGraph**, and **Retrieval-Augmented Generation (RAG)**.

---

## 🏗️ Project Structure

This is a monorepo containing both the backend service and the frontend web application:

```
├── backend/            # FastAPI Python Backend
│   ├── app/            # LangGraph workflows, routes, prompts & RAG system
│   ├── uploads/        # Temporal storage for uploaded PDF resumes (git-ignored)
│   ├── chroma_db/      # Ephemeral vector store database (git-ignored)
│   ├── .env.example    # Environment configuration template
│   └── requirements.txt# Python dependencies
│
├── frontend/           # Next.js React Frontend
│   ├── src/app/        # Premium Dark-themed Chat UI & upload pages
│   ├── package.json    # Next.js dependencies
│   └── tailwind.config.js
│
└── .gitignore          # Global git ignore configurations
```

---

## 🚀 Getting Started

### 1. Setup the Backend
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv .venv
   # On Windows:
   .venv\Scripts\activate
   # On macOS/Linux:
   source .venv/bin/activate
   ```
3. Install the dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure your environment keys. Create a `.env` file from the template:
   ```bash
   cp .env.example .env
   ```
   Add your OpenAI API key to `.env`:
   ```env
   OPENAI_API_KEY=sk-proj-yourRealApiKeyHere
   ```
5. Run the FastAPI development server:
   ```bash
   python -m uvicorn app.main:app --reload
   ```
   *The backend will be available at:* `http://127.0.0.1:8000`

---

### 2. Setup the Frontend
1. Open a new terminal window and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install the node packages:
   ```bash
   npm install
   ```
3. Run the Next.js development server:
   ```bash
   npm run dev
   ```
   *The web UI will be available at:* `http://localhost:3000`

---

## ⚡ Deployment Guide

This project is fully ready to be deployed:

### 🌐 Backend (Render)
1. Go to [Render](https://render.com/) and create a new **Web Service**.
2. Connect your GitHub repository.
3. Configure the settings:
   * **Runtime:** `Python`
   * **Root Directory:** `backend` *(CRITICAL: Tell Render to look inside the backend folder!)*
   * **Build Command:** `pip install -r requirements.txt`
   * **Start Command:** `python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Under **Environment Variables**, add:
   * `OPENAI_API_KEY` = `your_openai_api_key`

### 💻 Frontend (Vercel)
1. Go to [Vercel](https://vercel.com/) and import your repository.
2. In the configuration page:
   * **Framework Preset:** `Next.js`
   * **Root Directory:** Edit and select `frontend` *(CRITICAL: Tell Vercel to only build the frontend folder!)*
3. Click **Deploy**. Vercel will handle building the Next.js app automatically.
