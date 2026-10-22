import { useState, useRef } from "react";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Clock,
  Trophy,
  Check,
  CheckCircle2,
  Copy,
  Play,
  Sparkles,
  Users,
  Heart,
  Shield,
  Sword,
  ImageIcon,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { saveQuiz } from "../utils/quizStorage";

const categories = [
  "Tech & Code",
  "General Knowledge",
  "Science",
  "Mathematics",
  "Entertainment",
  "Sports",
];

const gameModes = ["Team vs Team", "Solo", "Survival"];

const TEAM_COLORS = [
  { bg: "rgba(139,92,246,0.15)", border: "rgba(139,92,246,0.5)", accent: "#c084fc", name: "Violet" },
  { bg: "rgba(56,189,248,0.15)", border: "rgba(56,189,248,0.5)", accent: "#38bdf8", name: "Cyan" },
  { bg: "rgba(245,158,11,0.15)", border: "rgba(245,158,11,0.5)", accent: "#fbbf24", name: "Amber" },
  { bg: "rgba(16,185,129,0.15)", border: "rgba(16,185,129,0.5)", accent: "#34d399", name: "Emerald" },
  { bg: "rgba(239,68,68,0.15)", border: "rgba(239,68,68,0.5)", accent: "#f87171", name: "Rose" },
  { bg: "rgba(99,102,241,0.15)", border: "rgba(99,102,241,0.5)", accent: "#818cf8", name: "Indigo" },
  { bg: "rgba(236,72,153,0.15)", border: "rgba(236,72,153,0.5)", accent: "#f472b6", name: "Pink" },
  { bg: "rgba(234,179,8,0.15)", border: "rgba(234,179,8,0.5)", accent: "#facc15", name: "Yellow" },
  { bg: "rgba(20,184,166,0.15)", border: "rgba(20,184,166,0.5)", accent: "#2dd4bf", name: "Teal" },
  { bg: "rgba(249,115,22,0.15)", border: "rgba(249,115,22,0.5)", accent: "#fb923c", name: "Orange" },
];

function makeTeam(index) {
  return { id: Date.now() + index, name: `Team ${index + 1}` };
}

function makeQuestion() {
  return {
    id: Date.now() + Math.random(),
    text: "",
    imageDataUrl: null,
    time: 20,
    points: 100,
    options: ["", "", "", ""],
    correctAnswer: 0,
  };
}

export default function CreateChallenge() {
  const navigate = useNavigate();

  // --- base fields ---
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Tech & Code");
  const [gameMode, setGameMode] = useState("Team vs Team");

  // --- Team vs Team config ---
  const [teams, setTeams] = useState([makeTeam(0), makeTeam(1)]);

  // --- Survival config ---
  const [survivalLives, setSurvivalLives] = useState(3);

  // --- questions ---
  const [questions, setQuestions] = useState([makeQuestion()]);

  // --- publish / UI state ---
  const [error, setError] = useState("");
  const [publishedQuiz, setPublishedQuiz] = useState(null);
  const [copiedPin, setCopiedPin] = useState(false);
  const [expandedQ, setExpandedQ] = useState({}); // per question id

  // ─── Teams helpers ───────────────────────────────────────────────
  const addTeam = () => {
    if (teams.length >= 10) return;
    setTeams((t) => [...t, makeTeam(t.length)]);
  };

  const removeTeam = (id) => {
    if (teams.length <= 2) return;
    setTeams((t) => t.filter((tm) => tm.id !== id));
  };

  const updateTeamName = (id, name) => {
    setTeams((t) => t.map((tm) => (tm.id === id ? { ...tm, name } : tm)));
  };

  // ─── Questions helpers ───────────────────────────────────────────
  const updateQuestion = (id, field, value) => {
    setQuestions((qs) =>
      qs.map((q) => (q.id === id ? { ...q, [field]: value } : q))
    );
    setError("");
  };

  const updateOption = (id, optIdx, value) => {
    setQuestions((qs) =>
      qs.map((q) => {
        if (q.id !== id) return q;
        const opts = [...q.options];
        opts[optIdx] = value;
        return { ...q, options: opts };
      })
    );
    setError("");
  };

  const setCorrect = (id, optIdx) => {
    setQuestions((qs) =>
      qs.map((q) => (q.id === id ? { ...q, correctAnswer: optIdx } : q))
    );
  };

  const addQuestion = () => {
    const nq = makeQuestion();
    setQuestions((qs) => [...qs, nq]);
    setExpandedQ((prev) => ({ ...prev, [nq.id]: true }));
  };

  const removeQuestion = (id) => {
    if (questions.length <= 1) return;
    setQuestions((qs) => qs.filter((q) => q.id !== id));
  };

  const toggleExpand = (id) =>
    setExpandedQ((prev) => ({ ...prev, [id]: !prev[id] }));

  // ─── Image upload ─────────────────────────────────────────────────
  const handleImageUpload = (id, file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => updateQuestion(id, "imageDataUrl", e.target.result);
    reader.readAsDataURL(file);
  };

  const clearImage = (id) => updateQuestion(id, "imageDataUrl", null);

  // ─── Publish ──────────────────────────────────────────────────────
  const handlePublish = (e) => {
    e.preventDefault();
    if (!title.trim()) { setError("Please enter a challenge title."); return; }

    // validate teams
    if (gameMode === "Team vs Team") {
      for (let i = 0; i < teams.length; i++) {
        if (!teams[i].name.trim()) {
          setError(`Team ${i + 1} needs a name.`); return;
        }
      }
    }

    // validate questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text.trim() && !q.imageDataUrl) {
        setError(`Question ${i + 1} must have text or an image.`); return;
      }
      const filled = q.options.filter((o) => o.trim());
      if (filled.length < 2) {
        setError(`Question ${i + 1} needs at least 2 answer choices.`); return;
      }
      if (!q.options[q.correctAnswer]?.trim()) {
        setError(
          `Question ${i + 1}: selected correct option (${["A","B","C","D"][q.correctAnswer]}) is empty.`
        );
        return;
      }
    }

    setError("");

    const saved = saveQuiz({
      title: title.trim(),
      category,
      gameMode,
      teams: gameMode === "Team vs Team"
        ? teams.map((t, i) => ({ id: t.id, name: t.name.trim() || `Team ${i + 1}`, colorIndex: i }))
        : [],
      survivalLives: gameMode === "Survival" ? Number(survivalLives) : null,
      questions: questions.map((q, idx) => ({
        id: String(q.id),
        text: q.text.trim(),
        imageDataUrl: q.imageDataUrl || null,
        time: Number(q.time) || 20,
        points: Number(q.points) || 100,
        options: q.options.map((o) => o.trim()),
        correctAnswer: q.correctAnswer,
      })),
    });

    setPublishedQuiz(saved);
  };

  const handleCopyPin = () => {
    if (!publishedQuiz) return;
    navigator.clipboard.writeText(publishedQuiz.pin);
    setCopiedPin(true);
    setTimeout(() => setCopiedPin(false), 2000);
  };

  // ─── Computed preview ─────────────────────────────────────────────
  const totalPoints = questions.reduce((s, q) => s + (Number(q.points) || 0), 0);
  const totalTime = questions.reduce((s, q) => s + (Number(q.time) || 0), 0);

  return (
    <main className="page-container">
      <div className="page-header">
        <Link to="/" className="back-link">
          <ArrowLeft size={16} />
          Back to Home
        </Link>
        <span className="badge-pill">CHALLENGE STUDIO</span>
        <h1>Create a Challenge</h1>
        <p>Build your quiz and configure the game mode.</p>
      </div>

      <div className="studio-layout">
        {/* ── MAIN FORM ── */}
        <form className="studio-card main-form" onSubmit={handlePublish}>

          {/* Title */}
          <div className="form-group">
            <label htmlFor="challenge-title">Challenge Title</label>
            <input
              id="challenge-title"
              className="text-input"
              type="text"
              placeholder="e.g. Ultimate Coding Showdown"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              required
            />
          </div>

          {/* Category + Mode */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="challenge-category">Category</label>
              <select
                id="challenge-category"
                className="select-input"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="challenge-mode">Game Mode</label>
              <select
                id="challenge-mode"
                className="select-input"
                value={gameMode}
                onChange={(e) => setGameMode(e.target.value)}
              >
                {gameModes.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          {/* ── MODE-SPECIFIC CONFIG ── */}
          {gameMode === "Team vs Team" && (
            <div className="mode-config-section">
              <div className="mode-config-header">
                <div className="mode-config-icon" style={{ background: "rgba(139,92,246,0.15)", color: "#c084fc" }}>
                  <Users size={18} />
                </div>
                <div>
                  <h3>Team Configuration</h3>
                  <p>Set up {teams.length} team{teams.length > 1 ? "s" : ""} (max 10). Questions rotate in round-robin order.</p>
                </div>
              </div>

              <div className="teams-grid">
                {teams.map((team, idx) => {
                  const col = TEAM_COLORS[idx % TEAM_COLORS.length];
                  return (
                    <div
                      key={team.id}
                      className="team-config-card"
                      style={{ background: col.bg, borderColor: col.border }}
                    >
                      <div className="team-config-index" style={{ color: col.accent }}>
                        {idx + 1}
                      </div>
                      <input
                        type="text"
                        className="team-name-input"
                        value={team.name}
                        onChange={(e) => updateTeamName(team.id, e.target.value)}
                        placeholder={`Team ${idx + 1}`}
                        maxLength={30}
                        style={{ color: col.accent }}
                      />
                      {teams.length > 2 && (
                        <button
                          type="button"
                          className="team-remove-btn"
                          onClick={() => removeTeam(team.id)}
                          title="Remove team"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  );
                })}

                {teams.length < 10 && (
                  <button
                    type="button"
                    className="team-add-card"
                    onClick={addTeam}
                  >
                    <Plus size={20} />
                    <span>Add Team</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {gameMode === "Survival" && (
            <div className="mode-config-section">
              <div className="mode-config-header">
                <div className="mode-config-icon" style={{ background: "rgba(239,68,68,0.15)", color: "#f87171" }}>
                  <Shield size={18} />
                </div>
                <div>
                  <h3>Survival Settings</h3>
                  <p>Each participant starts with a set number of lives. Wrong answer = lose a life. Last one standing wins!</p>
                </div>
              </div>
              <div className="lives-selector">
                <label className="lives-label">Starting Lives</label>
                <div className="lives-picker">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      className={`life-option-btn ${survivalLives === n ? "active" : ""}`}
                      onClick={() => setSurvivalLives(n)}
                    >
                      <span className="life-hearts">{"❤️".repeat(n)}</span>
                      <span className="life-count">{n} {n === 1 ? "life" : "lives"}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {gameMode === "Solo" && (
            <div className="mode-config-section">
              <div className="mode-config-header">
                <div className="mode-config-icon" style={{ background: "rgba(56,189,248,0.15)", color: "#38bdf8" }}>
                  <Sword size={18} />
                </div>
                <div>
                  <h3>Solo Mode</h3>
                  <p>Single-player challenge with streak multipliers and speed bonuses. Aim for maximum accuracy and the fastest answers!</p>
                </div>
              </div>
            </div>
          )}

          {/* ── QUESTIONS ── */}
          <div className="questions-section">
            <div className="section-head">
              <div>
                <h2>Questions</h2>
                <p>Add text, optional images, answer choices, and mark the correct one.</p>
              </div>
              <button
                type="button"
                className="button button-secondary btn-sm"
                onClick={addQuestion}
              >
                <Plus size={16} />
                Add Question
              </button>
            </div>

            <div className="questions-list">
              {questions.map((question, index) => {
                const isExpanded = expandedQ[question.id] !== false;
                // When gameMode is team, show which team gets this question
                const assignedTeamIdx = index % teams.length;
                const teamColor = TEAM_COLORS[assignedTeamIdx % TEAM_COLORS.length];
                const teamName = gameMode === "Team vs Team"
                  ? (teams[assignedTeamIdx]?.name?.trim() || `Team ${assignedTeamIdx + 1}`)
                  : null;

                return (
                  <div className="question-item-card" key={question.id}>
                    {/* Card header */}
                    <div className="q-card-header">
                      <div className="q-number">{index + 1}</div>
                      <div className="q-header-info">
                        <span className="q-prompt-preview">
                          {question.text.trim() || (question.imageDataUrl ? "📷 Image question" : "Untitled question")}
                        </span>
                        {gameMode === "Team vs Team" && (
                          <span
                            className="q-team-badge"
                            style={{ background: teamColor.bg, color: teamColor.accent, borderColor: teamColor.border }}
                          >
                            <Users size={11} />
                            {teamName}
                          </span>
                        )}
                      </div>
                      <div className="q-header-actions">
                        {questions.length > 1 && (
                          <button
                            type="button"
                            className="remove-question"
                            onClick={() => removeQuestion(question.id)}
                            title="Remove question"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                        <button
                          type="button"
                          className="q-expand-btn"
                          onClick={() => toggleExpand(question.id)}
                          title={isExpanded ? "Collapse" : "Expand"}
                        >
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="q-details q-details-expanded">
                        {/* Question text */}
                        <div className="form-group" style={{ marginBottom: "12px" }}>
                          <label htmlFor={`question-${question.id}`}>Question Prompt</label>
                          <input
                            id={`question-${question.id}`}
                            className="inline-input"
                            type="text"
                            placeholder="Enter question text..."
                            value={question.text}
                            onChange={(e) => updateQuestion(question.id, "text", e.target.value)}
                            maxLength={500}
                          />
                        </div>

                        {/* Image upload */}
                        <div className="image-upload-area">
                          {question.imageDataUrl ? (
                            <div className="image-preview-wrap">
                              <img
                                src={question.imageDataUrl}
                                alt="Question visual"
                                className="question-image-preview"
                              />
                              <button
                                type="button"
                                className="image-remove-btn"
                                onClick={() => clearImage(question.id)}
                                title="Remove image"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ) : (
                            <label className="image-upload-label" htmlFor={`img-${question.id}`}>
                              <ImageIcon size={20} />
                              <span>Upload Image (optional, max 5 MB)</span>
                              <input
                                id={`img-${question.id}`}
                                type="file"
                                accept="image/*"
                                style={{ display: "none" }}
                                onChange={(e) => handleImageUpload(question.id, e.target.files[0])}
                              />
                            </label>
                          )}
                        </div>

                        {/* Options builder */}
                        <div className="options-builder">
                          <span className="options-builder-label">
                            Answer Choices — click the circle to mark the correct answer
                          </span>
                          <div className="options-grid">
                            {question.options.map((option, optIdx) => {
                              const letter = ["A", "B", "C", "D"][optIdx];
                              const isCorrect = question.correctAnswer === optIdx;
                              return (
                                <div
                                  key={optIdx}
                                  className={`option-input-wrapper ${isCorrect ? "is-correct" : ""}`}
                                >
                                  <button
                                    type="button"
                                    className={`option-radio-btn ${isCorrect ? "checked" : ""}`}
                                    onClick={() => setCorrect(question.id, optIdx)}
                                    title={`Mark ${letter} as correct`}
                                  >
                                    {isCorrect ? <Check size={13} /> : null}
                                  </button>
                                  <span className="option-letter">{letter}</span>
                                  <input
                                    type="text"
                                    className="option-text-input"
                                    placeholder={`Option ${letter}...`}
                                    value={option}
                                    onChange={(e) => updateOption(question.id, optIdx, e.target.value)}
                                    required={optIdx < 2}
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Time + Points */}
                        <div className="q-meta">
                          <label>
                            <Clock size={14} />
                            <span>Time (sec)</span>
                            <input
                              type="number"
                              min="5"
                              max="300"
                              value={question.time}
                              onChange={(e) => updateQuestion(question.id, "time", Number(e.target.value))}
                            />
                          </label>
                          <label>
                            <Trophy size={14} />
                            <span>Points</span>
                            <input
                              type="number"
                              min="1"
                              max="10000"
                              value={question.points}
                              onChange={(e) => updateQuestion(question.id, "points", Number(e.target.value))}
                            />
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {error && <p className="form-error" role="alert">{error}</p>}

          <div className="form-actions">
            <button type="submit" className="button button-primary">
              <Sparkles size={16} />
              Publish Challenge
            </button>
          </div>
        </form>

        {/* ── SIDEBAR PREVIEW ── */}
        <aside className="sidebar-preview">
          <div className="preview-top">
            <span className="preview-label">LIVE PREVIEW</span>
            <span className="round-label">
              {questions.length} {questions.length === 1 ? "QUESTION" : "QUESTIONS"}
            </span>
          </div>

          <div className="sidebar-preview-content">
            <div className="preview-meta-tag">{category}</div>
            <h2 className="preview-title">{title.trim() || "Your Challenge Title"}</h2>
            <p className="preview-mode">{gameMode}</p>

            {gameMode === "Team vs Team" && (
              <div className="preview-teams-list">
                {teams.map((team, idx) => {
                  const col = TEAM_COLORS[idx % TEAM_COLORS.length];
                  return (
                    <div
                      key={team.id}
                      className="preview-team-chip"
                      style={{ background: col.bg, borderColor: col.border, color: col.accent }}
                    >
                      <Users size={11} />
                      <span>{team.name.trim() || `Team ${idx + 1}`}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {gameMode === "Survival" && (
              <div className="preview-survival-lives">
                <Shield size={13} style={{ color: "#f87171" }} />
                <span>Starting Lives: <strong>{"❤️".repeat(survivalLives)}</strong></span>
              </div>
            )}

            <div className="preview-stats">
              <div>
                <strong>{questions.length}</strong>
                <span>Questions</span>
              </div>
              <div>
                <strong>{totalPoints}</strong>
                <span>Total Pts</span>
              </div>
              <div>
                <strong>{totalTime}s</strong>
                <span>Total Time</span>
              </div>
            </div>

            <div className="preview-question-list">
              <h3>Question Preview</h3>
              {questions.map((question, index) => {
                const teamIdx = index % teams.length;
                const col = TEAM_COLORS[teamIdx % TEAM_COLORS.length];
                return (
                  <div className="preview-question" key={question.id}>
                    <span>{index + 1}.</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {gameMode === "Team vs Team" && (
                        <span
                          style={{
                            display: "inline-block",
                            fontSize: "10px",
                            fontWeight: 700,
                            padding: "1px 6px",
                            borderRadius: "99px",
                            background: col.bg,
                            color: col.accent,
                            marginBottom: "3px",
                          }}
                        >
                          {teams[teamIdx]?.name?.trim() || `Team ${teamIdx + 1}`}
                        </span>
                      )}
                      {question.imageDataUrl && (
                        <span style={{ fontSize: "11px", color: "#38bdf8", display: "block", marginBottom: "2px" }}>
                          📷 Image attached
                        </span>
                      )}
                      <p>{question.text.trim() || "Question prompt will appear here"}</p>
                      <div className="preview-choices">
                        {question.options.map((opt, optIdx) => (
                          <div
                            key={optIdx}
                            className={`preview-choice-item ${question.correctAnswer === optIdx ? "correct" : ""}`}
                          >
                            <span>{["A", "B", "C", "D"][optIdx]}.</span>
                            <span>{opt.trim() || `Option ${["A", "B", "C", "D"][optIdx]}`}</span>
                            {question.correctAnswer === optIdx && <Check size={11} color="#10b981" />}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="info-box">
              Publishing generates a unique 6-digit PIN saved locally. Share it with your teams!
            </div>
          </div>
        </aside>
      </div>

      {/* ── PUBLISH MODAL ── */}
      {publishedQuiz && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <div className="modal-icon-badge">
              <CheckCircle2 size={36} />
            </div>
            <h2 className="modal-title">Challenge Published!</h2>
            <p className="modal-subtitle">
              &quot;{publishedQuiz.title}&quot; ({publishedQuiz.gameMode}) is live and ready.
            </p>
            <div className="pin-display-box">
              <div className="pin-label">Shareable 6-Digit Game PIN</div>
              <div className="pin-digits">{publishedQuiz.pin}</div>
            </div>
            <div className="modal-actions">
              <button
                className="button button-primary"
                onClick={() => navigate(`/play/${publishedQuiz.pin}`)}
              >
                <Play size={16} />
                <span>Enter Arena &amp; Play</span>
              </button>
              <button className="button button-secondary" onClick={handleCopyPin}>
                {copiedPin ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
                <span>{copiedPin ? "PIN Copied!" : "Copy Game PIN"}</span>
              </button>
              <button className="button button-secondary" onClick={() => navigate("/")}>
                Back to Home
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}