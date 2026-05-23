"use client";

import { useState, useRef, useEffect } from "react";

const TOTAL_QUESTIONS = 5;

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 8 ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
    : score >= 5 ? "text-amber-400 bg-amber-400/10 border-amber-400/20"
    : "text-red-400 bg-red-400/10 border-red-400/20";
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-bold ${color}`}>
      {score}/10
    </span>
  );
}

function TypeBadge({ type }: { type: string }) {
  return type === "technical" ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-400 border-purple-500/20">
      ⚙ Technical
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border-amber-500/20">
      💬 Behavioral
    </span>
  );
}

export default function Home() {
  const [role, setRole] = useState("Software Engineer");
  const [difficulty, setDifficulty] = useState("Medium");
  const [sessionId, setSessionId] = useState("");
  const [question, setQuestion] = useState("");
  const [activeQuestionType, setActiveQuestionType] = useState("technical");
  const [answer, setAnswer] = useState("");
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [interviewComplete, setInterviewComplete] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumePath, setResumePath] = useState("");
  const [uploadingResume, setUploadingResume] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, question]);

  async function handleResumeUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") { setErrorMsg("Only PDF files are supported."); return; }
    setResumeFile(file);
    setUploadingResume(true);
    setUploadSuccess(false);
    setErrorMsg("");
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("http://127.0.0.1:8000/upload-resume", { method: "POST", body: formData });
      const data = await res.json();
      if (data.file_path) { setResumePath(data.file_path); setUploadSuccess(true); }
      else setErrorMsg(data.error || "Upload failed. Please try again.");
    } catch {
      setErrorMsg("Cannot connect to backend. Ensure the server is running.");
    }
    setUploadingResume(false);
  }

  async function startInterview() {
    if (!resumePath) { setErrorMsg("Please upload your resume first."); return; }
    setLoading(true); setErrorMsg("");
    try {
      const res = await fetch("http://127.0.0.1:8000/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, difficulty, skills: ["Python", "React", "System Design", "SQL"], resume_path: resumePath }),
      });
      const data = await res.json();
      if (data.error) { setErrorMsg(data.error); setLoading(false); return; }
      setSessionId(data.session_id);
      setQuestion(data.question);
      setActiveQuestionType(data.question_type || "technical");
      setHistory([]); setInterviewComplete(false); setAnswer("");
    } catch { setErrorMsg("Could not connect to the backend server."); }
    setLoading(false);
  }

  async function submitAnswer() {
    if (!answer.trim()) return;
    setLoading(true); setErrorMsg("");
    try {
      const res = await fetch("http://127.0.0.1:8000/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, answer }),
      });
      const data = await res.json();
      if (data.error) { setErrorMsg(data.error); setLoading(false); return; }
      setHistory(prev => [...prev, {
        question, questionType: activeQuestionType, answer,
        score: data.score, feedback: data.feedback,
      }]);
      setInterviewComplete(data.interview_complete);
      if (!data.interview_complete) {
        setQuestion(data.follow_up_question);
        setActiveQuestionType(data.next_question_type || "technical");
      } else { setQuestion(""); }
      setAnswer("");
    } catch { setErrorMsg("Error submitting your answer. Please try again."); }
    setLoading(false);
  }

  function reset() {
    setSessionId(""); setQuestion(""); setHistory([]); setInterviewComplete(false);
    setAnswer(""); setResumeFile(null); setResumePath(""); setUploadSuccess(false); setErrorMsg("");
  }

  const avgScore = history.length > 0
    ? Math.round(history.reduce((s, h) => s + h.score, 0) / history.length)
    : null;

  return (
    <main className="min-h-screen bg-[#0d0f14] bg-grid text-[#f0f2f8] font-['Inter',sans-serif]">
      {/* Top Nav */}
      <nav className="border-b border-white/[0.07] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#4f8ef7] to-[#9b6dff] flex items-center justify-center text-white font-bold text-sm">AI</div>
          <span className="font-semibold text-white/90 text-sm tracking-tight">Interview Simulator</span>
        </div>
        {sessionId && (
          <button onClick={reset} className="text-xs font-medium text-red-400 hover:text-red-300 bg-red-400/10 hover:bg-red-400/15 border border-red-400/20 px-3 py-1.5 rounded-lg transition-colors">
            End Session
          </button>
        )}
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* Hero — show only before session starts */}
        {!sessionId && (
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#4f8ef7]/25 bg-[#4f8ef7]/10 text-[#4f8ef7] text-xs font-semibold mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4f8ef7] inline-block"></span>
              Powered by LangGraph + RAG
            </div>
            <h1 className="text-5xl font-extrabold tracking-tight leading-tight">
              <span className="text-white">Ace Your Next</span>{" "}
              <span className="bg-gradient-to-r from-[#4f8ef7] to-[#9b6dff] bg-clip-text text-transparent">Interview</span>
            </h1>
            <p className="mt-4 text-[#8b92a8] text-lg max-w-xl mx-auto leading-relaxed">
              Upload your resume. Get personalized, AI-generated questions tailored to your background and target role.
            </p>
          </div>
        )}

        {/* Error Banner */}
        {errorMsg && (
          <div className="mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-2.5">
            <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            </svg>
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg("")} className="ml-auto shrink-0 text-red-400/60 hover:text-red-400">✕</button>
          </div>
        )}

        {/* Progress Bar */}
        {sessionId && (
          <div className="mb-6 bg-[#13161e] rounded-2xl border border-white/[0.07] p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-xs font-bold text-[#545b6f] uppercase tracking-wider">Progress</span>
                <p className="text-sm font-semibold text-white mt-0.5">{role} · {difficulty}</p>
              </div>
              <div className="flex items-center gap-3">
                {avgScore !== null && (
                  <div className="text-center">
                    <p className="text-[10px] text-[#545b6f] uppercase tracking-wider font-bold">Avg Score</p>
                    <ScoreBadge score={avgScore} />
                  </div>
                )}
                <div className="text-center">
                  <p className="text-[10px] text-[#545b6f] uppercase tracking-wider font-bold">Questions</p>
                  <p className="text-sm font-bold text-white">{history.length}/{TOTAL_QUESTIONS}</p>
                </div>
              </div>
            </div>
            <div className="w-full bg-white/[0.07] rounded-full h-2 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#4f8ef7] to-[#9b6dff] transition-all duration-500"
                style={{ width: `${Math.min((history.length / TOTAL_QUESTIONS) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Setup Card */}
        {!sessionId && (
          <div className="bg-[#13161e] rounded-2xl border border-white/[0.07] p-7 space-y-6">
            <h2 className="text-lg font-bold text-white">Configure Your Session</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Dropdowns */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#545b6f] uppercase tracking-wider mb-2">Target Role</label>
                  <select
                    value={role} onChange={e => setRole(e.target.value)}
                    className="w-full bg-[#1a1e2a] border border-white/[0.09] text-white rounded-xl px-4 py-3 text-sm font-medium appearance-none focus:ring-2 focus:ring-[#4f8ef7]/50 focus:border-[#4f8ef7]/50 transition"
                  >
                    {["Software Engineer","Frontend Developer","Backend Developer","Fullstack Developer","ML Engineer","Data Scientist","DevOps Engineer","Product Manager"].map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#545b6f] uppercase tracking-wider mb-2">Difficulty</label>
                  <select
                    value={difficulty} onChange={e => setDifficulty(e.target.value)}
                    className="w-full bg-[#1a1e2a] border border-white/[0.09] text-white rounded-xl px-4 py-3 text-sm font-medium appearance-none focus:ring-2 focus:ring-[#4f8ef7]/50 focus:border-[#4f8ef7]/50 transition"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              {/* Resume Uploader */}
              <div>
                <label className="block text-xs font-bold text-[#545b6f] uppercase tracking-wider mb-2">Resume (PDF)</label>
                <input type="file" accept=".pdf" ref={fileInputRef} onChange={handleResumeUpload} className="hidden" />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`h-[130px] rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${
                    uploadSuccess
                      ? "border-emerald-500/40 bg-emerald-500/[0.06] hover:bg-emerald-500/[0.09]"
                      : "border-white/[0.1] bg-[#1a1e2a] hover:border-[#4f8ef7]/40 hover:bg-[#4f8ef7]/[0.04]"
                  }`}
                >
                  {uploadingResume ? (
                    <div className="flex flex-col items-center gap-2 text-[#8b92a8]">
                      <svg className="animate-spin h-6 w-6 text-[#4f8ef7]" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      <span className="text-xs font-medium">Uploading...</span>
                    </div>
                  ) : uploadSuccess && resumeFile ? (
                    <div className="flex flex-col items-center gap-1.5 text-center px-4">
                      <svg className="w-7 h-7 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      <span className="text-sm font-semibold text-emerald-400 truncate max-w-[180px]">{resumeFile.name}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500/70">Parsed & Ready</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1.5 text-center px-4">
                      <svg className="w-7 h-7 text-[#545b6f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                      </svg>
                      <span className="text-sm font-semibold text-[#8b92a8]">Click to upload PDF</span>
                      <span className="text-[10px] text-[#545b6f]">Your resume powers AI question generation</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Start Button */}
            <button
              onClick={startInterview}
              disabled={loading || !uploadSuccess}
              className="w-full py-3.5 rounded-xl font-bold text-sm tracking-wide bg-gradient-to-r from-[#4f8ef7] to-[#9b6dff] text-white hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity flex items-center justify-center gap-2 shadow-lg shadow-[#4f8ef7]/20"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Analyzing Resume & Generating Questions...
                </>
              ) : (
                "Start Interview Simulation →"
              )}
            </button>
          </div>
        )}

        {/* Chat Interface */}
        {sessionId && (
          <div className="bg-[#13161e] rounded-2xl border border-white/[0.07] overflow-hidden flex flex-col">

            {/* Chat Thread */}
            <div className="chat-scroll overflow-y-auto max-h-[520px] min-h-[380px] p-6 space-y-6 bg-[#0f1117]">

              {/* History */}
              {history.map((item, i) => (
                <div key={i} className="space-y-3">

                  {/* Question bubble */}
                  <div className="flex gap-3 items-start max-w-[86%]">
                    <div className="w-7 h-7 rounded-lg bg-[#4f8ef7]/15 border border-[#4f8ef7]/20 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-[#4f8ef7] text-xs font-bold">AI</span>
                    </div>
                    <div className="bg-[#1a1e2a] border border-white/[0.07] rounded-2xl rounded-tl-md px-5 py-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#545b6f]">Interviewer</span>
                        <TypeBadge type={item.questionType} />
                      </div>
                      <p className="text-[#d0d5e8] text-sm leading-relaxed">{item.question}</p>
                    </div>
                  </div>

                  {/* Answer bubble */}
                  <div className="flex gap-3 items-start justify-end">
                    <div className="max-w-[86%] bg-gradient-to-br from-[#4f8ef7]/15 to-[#9b6dff]/10 border border-[#4f8ef7]/20 rounded-2xl rounded-tr-md px-5 py-4">
                      <div className="flex items-center justify-between gap-4 mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#4f8ef7]/70">You</span>
                        <ScoreBadge score={item.score} />
                      </div>
                      <p className="text-[#d0d5e8] text-sm leading-relaxed whitespace-pre-wrap">{item.answer}</p>
                    </div>
                    <div className="w-7 h-7 rounded-lg bg-[#9b6dff]/15 border border-[#9b6dff]/20 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-[#9b6dff] text-xs font-bold">U</span>
                    </div>
                  </div>

                  {/* Feedback */}
                  <div className="ml-10 bg-emerald-500/[0.07] border border-emerald-500/[0.18] rounded-xl px-4 py-3 flex gap-2.5">
                    <svg className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <p className="text-sm text-emerald-300/80 leading-relaxed">{item.feedback}</p>
                  </div>

                </div>
              ))}

              {/* Active question */}
              {question && !interviewComplete && (
                <div className="flex gap-3 items-start max-w-[86%]">
                  <div className="w-7 h-7 rounded-lg bg-[#4f8ef7]/15 border border-[#4f8ef7]/20 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[#4f8ef7] text-xs font-bold">AI</span>
                  </div>
                  <div className="bg-[#1a1e2a] border border-[#4f8ef7]/20 rounded-2xl rounded-tl-md px-5 py-4 shadow-[0_0_24px_rgba(79,142,247,0.08)]">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#545b6f]">Interviewer</span>
                      <TypeBadge type={activeQuestionType} />
                      <span className="text-[10px] text-[#4f8ef7]/60 font-medium ml-1">Q{history.length + 1}</span>
                    </div>
                    <p className="text-white text-sm leading-relaxed">{question}</p>
                  </div>
                </div>
              )}

              {/* Complete card */}
              {interviewComplete && (
                <div className="bg-gradient-to-br from-emerald-500/10 to-[#4f8ef7]/5 border border-emerald-500/20 rounded-2xl p-7 text-center my-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-7 h-7 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white">Interview Complete!</h3>
                  {avgScore !== null && (
                    <p className="text-[#8b92a8] text-sm mt-1">
                      You averaged <span className={`font-bold ${avgScore >= 7 ? "text-emerald-400" : avgScore >= 5 ? "text-amber-400" : "text-red-400"}`}>{avgScore}/10</span> across all questions.
                    </p>
                  )}
                  <button
                    onClick={reset}
                    className="mt-5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#4f8ef7] to-[#9b6dff] text-white font-bold text-sm hover:opacity-90 transition-opacity"
                  >
                    Start New Session
                  </button>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Answer Input */}
            {question && !interviewComplete && (
              <div className="border-t border-white/[0.07] p-4 bg-[#13161e]">
                <textarea
                  value={answer}
                  onChange={e => setAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  rows={3}
                  className="w-full bg-[#0f1117] border border-white/[0.09] text-[#d0d5e8] placeholder-[#545b6f] rounded-xl px-4 py-3 text-sm leading-relaxed resize-none focus:ring-2 focus:ring-[#4f8ef7]/40 focus:border-[#4f8ef7]/40 transition"
                  onKeyDown={e => { if (e.key === "Enter" && e.ctrlKey) submitAnswer(); }}
                />
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-[#545b6f]">Ctrl + Enter to submit</span>
                  <button
                    onClick={submitAnswer}
                    disabled={loading || !answer.trim()}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#4f8ef7] to-[#9b6dff] text-white font-bold text-sm hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity flex items-center gap-2 shadow-md shadow-[#4f8ef7]/20"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                        Evaluating...
                      </>
                    ) : "Submit Answer →"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </main>
  );
}