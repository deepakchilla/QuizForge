import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Trophy,
  Zap,
  Clock,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  XCircle,
  RotateCcw,
  Sparkles,
  Flame,
  Check,
  X,
  Heart,
  Shield,
  Users,
  Award,
  Sword,
} from 'lucide-react';
import { getQuizByPin, saveGameScore } from '../utils/quizStorage';

// ─── Color palette for teams ─────────────────────────────────────────────────
const TEAM_COLORS = [
  { bg: 'rgba(139,92,246,0.15)', border: 'rgba(139,92,246,0.5)', accent: '#c084fc' },
  { bg: 'rgba(56,189,248,0.15)', border: 'rgba(56,189,248,0.5)', accent: '#38bdf8' },
  { bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.5)', accent: '#fbbf24' },
  { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.5)', accent: '#34d399' },
  { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.5)', accent: '#f87171' },
  { bg: 'rgba(99,102,241,0.15)', border: 'rgba(99,102,241,0.5)', accent: '#818cf8' },
  { bg: 'rgba(236,72,153,0.15)', border: 'rgba(236,72,153,0.5)', accent: '#f472b6' },
  { bg: 'rgba(234,179,8,0.15)', border: 'rgba(234,179,8,0.5)', accent: '#facc15' },
  { bg: 'rgba(20,184,166,0.15)', border: 'rgba(20,184,166,0.5)', accent: '#2dd4bf' },
  { bg: 'rgba(249,115,22,0.15)', border: 'rgba(249,115,22,0.5)', accent: '#fb923c' },
];

// ─── Utility ──────────────────────────────────────────────────────────────────
function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

// ═══════════════════════════════════════════════════════════════════════════════
//  SOLO mode arena (existing behaviour, extracted to component for clarity)
// ═══════════════════════════════════════════════════════════════════════════════
function SoloArena({ quiz, pin, nickname }) {
  const navigate = useNavigate();

  const [gameState, setGameState] = useState('playing'); // 'playing' | 'completed'
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(quiz.questions[0]?.time ?? 20);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [history, setHistory] = useState([]);
  const timerRef = useRef(null);

  const currentQuestion = quiz.questions[currentIndex];

  useEffect(() => {
    if (gameState !== 'playing' || !currentQuestion) return;
    setTimeLeft(currentQuestion.time);
    setIsLocked(false);
    setSelectedOption(null);

    const start = Date.now();
    const dur = currentQuestion.time * 1000;

    timerRef.current = setInterval(() => {
      const rem = Math.max(0, (dur - (Date.now() - start)) / 1000);
      setTimeLeft(rem);
      if (rem <= 0) { clearInterval(timerRef.current); onTimeout(); }
    }, 50);

    return () => clearInterval(timerRef.current);
  }, [gameState, currentIndex]);

  const onTimeout = () => {
    if (isLocked) return;
    setIsLocked(true);
    setSelectedOption(-1);
    setStreak(0);
    setHistory((h) => [...h, { ...currentQuestion, selectedOption: -1, isCorrect: false, pointsEarned: 0 }]);
    setTimeout(advance, 1800);
  };

  const onSelect = (optIdx) => {
    if (isLocked) return;
    setIsLocked(true);
    setSelectedOption(optIdx);
    clearInterval(timerRef.current);

    const isCorrect = optIdx === currentQuestion.correctAnswer;
    let pts = 0;
    if (isCorrect) {
      const speed = timeLeft / currentQuestion.time;
      pts = currentQuestion.points + Math.round(speed * 30) + streak * 15;
      setScore((s) => s + pts);
      const ns = streak + 1;
      setStreak(ns);
      if (ns > maxStreak) setMaxStreak(ns);
    } else {
      setStreak(0);
    }
    setHistory((h) => [...h, { ...currentQuestion, selectedOption: optIdx, isCorrect, pointsEarned: pts }]);
    setTimeout(advance, 1400);
  };

  const advance = () => {
    if (currentIndex + 1 < quiz.questions.length) {
      setCurrentIndex((i) => i + 1);
    } else {
      setGameState('completed');
      saveGameScore(pin, { nickname, score, totalPossible: quiz.questions.reduce((s, q) => s + q.points, 0), totalQuestions: quiz.questions.length });
    }
  };

  const restart = () => {
    setCurrentIndex(0); setScore(0); setStreak(0); setMaxStreak(0);
    setHistory([]); setSelectedOption(null); setIsLocked(false); setGameState('playing');
  };

  // ── Results ──
  if (gameState === 'completed') {
    const correct = history.filter((h) => h.isCorrect).length;
    const acc = Math.round((correct / quiz.questions.length) * 100);
    return (
      <main className="page-container">
        <div className="results-card">
          <div className="results-trophy-wrap"><Trophy size={48} /></div>
          <h2 className="results-title">Challenge Complete!</h2>
          <p className="results-subtitle">Well done, <strong>{nickname}</strong>! Final results for &quot;{quiz.title}&quot;.</p>
          <div className="results-score-box">
            <div className="results-stat"><strong>{score}</strong><span>Points Earned</span></div>
            <div className="results-stat"><strong>{correct}/{quiz.questions.length}</strong><span>Correct ({acc}%)</span></div>
            <div className="results-stat"><strong>{maxStreak}</strong><span>Best Streak 🔥</span></div>
          </div>
          <div className="results-actions">
            <button className="button button-primary" onClick={restart}><RotateCcw size={16} /><span>Play Again</span></button>
            <button className="button button-secondary" onClick={() => navigate('/')}><ArrowLeft size={16} /><span>Home</span></button>
          </div>
          <div className="answer-review-section">
            <h3>Review</h3>
            <div className="review-list">
              {history.map((item, idx) => (
                <div key={idx} className={`review-item ${item.isCorrect ? 'was-correct' : 'was-incorrect'}`}>
                  <div className="review-item-q">{idx + 1}. {item.text}</div>
                  <div className="review-item-answers">
                    <span>Your answer: <strong style={{ color: item.isCorrect ? '#34d399' : '#f87171' }}>
                      {item.selectedOption === -1 ? 'Timed out' : `${['A','B','C','D'][item.selectedOption]}. ${item.options[item.selectedOption] || ''}`}
                    </strong></span>
                    {!item.isCorrect && <span style={{ color: '#38bdf8' }}>Correct: <strong>{['A','B','C','D'][item.correctAnswer]}. {item.options[item.correctAnswer]}</strong></span>}
                    <span style={{ marginLeft: 'auto', color: '#fbbf24', fontWeight: 600 }}>+{item.pointsEarned} pts</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ── Active question ──
  const pct = Math.max(0, (timeLeft / currentQuestion.time) * 100);
  let timerColor = '#38bdf8';
  if (pct < 30) timerColor = '#ef4444';
  else if (pct < 60) timerColor = '#f59e0b';

  return (
    <main className="arena-wrapper">
      <div className="arena-topbar">
        <div className="arena-meta">
          <Link to="/" className="back-link" style={{ margin: 0 }}><ArrowLeft size={16} /><span>Quit</span></Link>
          <span className="badge-pill">{quiz.category}</span>
          <span className="mode-tag-inline"><Sword size={14} /> Solo</span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {streak > 1 && <div className="arena-streak-pill"><Flame size={15} /><span>{streak} Streak!</span></div>}
          <div className="arena-score-pill"><Zap size={15} /><span>{score} PTS</span></div>
        </div>
      </div>

      <div className="timer-container">
        <div className="timer-fill" style={{ width: `${pct}%`, backgroundColor: timerColor }} />
      </div>

      <QuestionCard
        question={currentQuestion}
        index={currentIndex}
        total={quiz.questions.length}
        timeLeft={timeLeft}
        selectedOption={selectedOption}
        isLocked={isLocked}
        onSelect={onSelect}
        onAdvance={advance}
      />
    </main>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  TEAM VS TEAM mode arena
// ═══════════════════════════════════════════════════════════════════════════════
function TeamArena({ quiz, pin }) {
  const navigate = useNavigate();
  const teams = quiz.teams || [{ id: 'a', name: 'Team A', colorIndex: 0 }, { id: 'b', name: 'Team B', colorIndex: 1 }];

  const [gameState, setGameState] = useState('playing');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(quiz.questions[0]?.time ?? 20);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const [teamScores, setTeamScores] = useState(teams.map(() => 0));
  const [history, setHistory] = useState([]); // { qIndex, teamIndex, isCorrect, pts }
  const timerRef = useRef(null);

  const currentQuestion = quiz.questions[currentIndex];
  const currentTeamIndex = currentIndex % teams.length;
  const currentTeam = teams[currentTeamIndex];
  const teamColor = TEAM_COLORS[currentTeam.colorIndex ?? currentTeamIndex];

  useEffect(() => {
    if (gameState !== 'playing' || !currentQuestion) return;
    setTimeLeft(currentQuestion.time);
    setIsLocked(false);
    setSelectedOption(null);

    const start = Date.now();
    const dur = currentQuestion.time * 1000;

    timerRef.current = setInterval(() => {
      const rem = Math.max(0, (dur - (Date.now() - start)) / 1000);
      setTimeLeft(rem);
      if (rem <= 0) { clearInterval(timerRef.current); onTimeout(); }
    }, 50);

    return () => clearInterval(timerRef.current);
  }, [gameState, currentIndex]);

  const onTimeout = () => {
    if (isLocked) return;
    setIsLocked(true);
    setSelectedOption(-1);
    setHistory((h) => [...h, { qIndex: currentIndex, teamIndex: currentTeamIndex, isCorrect: false, pts: 0, selectedOption: -1 }]);
    setTimeout(advance, 2000);
  };

  const onSelect = (optIdx) => {
    if (isLocked) return;
    setIsLocked(true);
    setSelectedOption(optIdx);
    clearInterval(timerRef.current);

    const isCorrect = optIdx === currentQuestion.correctAnswer;
    let pts = 0;
    if (isCorrect) {
      const speed = timeLeft / currentQuestion.time;
      pts = currentQuestion.points + Math.round(speed * 30);
      setTeamScores((scores) => {
        const next = [...scores];
        next[currentTeamIndex] += pts;
        return next;
      });
    }
    setHistory((h) => [...h, { qIndex: currentIndex, teamIndex: currentTeamIndex, isCorrect, pts, selectedOption: optIdx }]);
    setTimeout(advance, 1600);
  };

  const advance = () => {
    if (currentIndex + 1 < quiz.questions.length) {
      setCurrentIndex((i) => i + 1);
    } else {
      setGameState('completed');
    }
  };

  const restart = () => {
    setCurrentIndex(0); setTeamScores(teams.map(() => 0));
    setHistory([]); setSelectedOption(null); setIsLocked(false); setGameState('playing');
  };

  // ── Results ──
  if (gameState === 'completed') {
    const sorted = teams
      .map((t, i) => ({ ...t, score: teamScores[i], colorIndex: t.colorIndex ?? i }))
      .sort((a, b) => b.score - a.score);

    return (
      <main className="page-container">
        <div className="results-card">
          <div className="results-trophy-wrap"><Trophy size={48} /></div>
          <h2 className="results-title">Battle Over!</h2>
          <p className="results-subtitle">&quot;{quiz.title}&quot; — Final Leaderboard</p>

          <div className="team-leaderboard">
            {sorted.map((team, rank) => {
              const col = TEAM_COLORS[team.colorIndex % TEAM_COLORS.length];
              return (
                <div key={team.id} className="team-leaderboard-row" style={{ background: col.bg, borderColor: col.border }}>
                  <span className="team-rank" style={{ color: col.accent }}>
                    {rank === 0 ? '🥇' : rank === 1 ? '🥈' : rank === 2 ? '🥉' : `${rank + 1}.`}
                  </span>
                  <span className="team-lb-name" style={{ color: col.accent }}>{team.name}</span>
                  <span className="team-lb-score" style={{ color: col.accent }}>{team.score} pts</span>
                </div>
              );
            })}
          </div>

          <div className="results-actions" style={{ marginTop: '2rem' }}>
            <button className="button button-primary" onClick={restart}><RotateCcw size={16} /><span>Play Again</span></button>
            <button className="button button-secondary" onClick={() => navigate('/')}><ArrowLeft size={16} /><span>Home</span></button>
          </div>

          <div className="answer-review-section">
            <h3>Question Breakdown</h3>
            <div className="review-list">
              {history.map((item, idx) => {
                const q = quiz.questions[item.qIndex];
                const team = teams[item.teamIndex];
                const col = TEAM_COLORS[(team.colorIndex ?? item.teamIndex) % TEAM_COLORS.length];
                return (
                  <div key={idx} className={`review-item ${item.isCorrect ? 'was-correct' : 'was-incorrect'}`}>
                    <div className="review-item-q">
                      <span
                        style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '99px', background: col.bg, color: col.accent, marginRight: '6px' }}
                      >{team.name}</span>
                      {idx + 1}. {q.text}
                    </div>
                    <div className="review-item-answers">
                      <span>Answer: <strong style={{ color: item.isCorrect ? '#34d399' : '#f87171' }}>
                        {item.selectedOption === -1 ? 'Timed out' : `${['A','B','C','D'][item.selectedOption]}. ${q.options[item.selectedOption] || ''}`}
                      </strong></span>
                      {!item.isCorrect && <span style={{ color: '#38bdf8' }}>Correct: <strong>{['A','B','C','D'][q.correctAnswer]}. {q.options[q.correctAnswer]}</strong></span>}
                      <span style={{ marginLeft: 'auto', color: '#fbbf24', fontWeight: 600 }}>+{item.pts} pts</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ── Active question ──
  const pct = Math.max(0, (timeLeft / currentQuestion.time) * 100);
  let timerColor = teamColor.accent;
  if (pct < 30) timerColor = '#ef4444';
  else if (pct < 60) timerColor = '#f59e0b';

  return (
    <main className="arena-wrapper">
      {/* Topbar */}
      <div className="arena-topbar">
        <div className="arena-meta">
          <Link to="/" className="back-link" style={{ margin: 0 }}><ArrowLeft size={16} /><span>Quit</span></Link>
          <span className="badge-pill">{quiz.category}</span>
          <span className="mode-tag-inline"><Users size={14} /> Team vs Team</span>
        </div>
        {/* Live scoreboard pills */}
        <div className="team-score-pills">
          {teams.map((team, i) => {
            const col = TEAM_COLORS[(team.colorIndex ?? i) % TEAM_COLORS.length];
            const isActive = i === currentTeamIndex;
            return (
              <div
                key={team.id}
                className={`team-score-pill ${isActive ? 'active' : ''}`}
                style={{ background: col.bg, borderColor: isActive ? col.accent : col.border, color: col.accent }}
              >
                <span>{team.name}</span>
                <span className="team-pill-score">{teamScores[i]} pts</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active team indicator */}
      <div
        className="active-team-banner"
        style={{ background: teamColor.bg, borderColor: teamColor.border, color: teamColor.accent }}
      >
        <Users size={16} />
        <span>It&apos;s <strong>{currentTeam.name}</strong>&apos;s turn — Question {currentIndex + 1} of {quiz.questions.length}</span>
      </div>

      <div className="timer-container">
        <div className="timer-fill" style={{ width: `${pct}%`, backgroundColor: timerColor }} />
      </div>

      <QuestionCard
        question={currentQuestion}
        index={currentIndex}
        total={quiz.questions.length}
        timeLeft={timeLeft}
        selectedOption={selectedOption}
        isLocked={isLocked}
        onSelect={onSelect}
        onAdvance={advance}
        accentColor={teamColor.accent}
      />
    </main>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  SURVIVAL mode arena
// ═══════════════════════════════════════════════════════════════════════════════
function SurvivalArena({ quiz, pin, nickname }) {
  const navigate = useNavigate();
  const maxLives = quiz.survivalLives ?? 3;

  const [gameState, setGameState] = useState('playing');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(quiz.questions[0]?.time ?? 20);
  const [lives, setLives] = useState(maxLives);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const [history, setHistory] = useState([]);
  const [justLostLife, setJustLostLife] = useState(false);
  const timerRef = useRef(null);

  const currentQuestion = quiz.questions[currentIndex];

  useEffect(() => {
    if (gameState !== 'playing' || !currentQuestion) return;
    setTimeLeft(currentQuestion.time);
    setIsLocked(false);
    setSelectedOption(null);
    setJustLostLife(false);

    const start = Date.now();
    const dur = currentQuestion.time * 1000;

    timerRef.current = setInterval(() => {
      const rem = Math.max(0, (dur - (Date.now() - start)) / 1000);
      setTimeLeft(rem);
      if (rem <= 0) { clearInterval(timerRef.current); onTimeout(); }
    }, 50);

    return () => clearInterval(timerRef.current);
  }, [gameState, currentIndex]);

  const onTimeout = () => {
    if (isLocked) return;
    setIsLocked(true);
    setSelectedOption(-1);
    const newLives = lives - 1;
    setLives(newLives);
    setJustLostLife(true);
    setHistory((h) => [...h, { ...currentQuestion, selectedOption: -1, isCorrect: false, pointsEarned: 0 }]);
    if (newLives <= 0) { setTimeout(() => setGameState('eliminated'), 1800); }
    else { setTimeout(advance, 2000); }
  };

  const onSelect = (optIdx) => {
    if (isLocked) return;
    setIsLocked(true);
    setSelectedOption(optIdx);
    clearInterval(timerRef.current);

    const isCorrect = optIdx === currentQuestion.correctAnswer;
    let pts = 0;
    if (isCorrect) {
      pts = currentQuestion.points + Math.round((timeLeft / currentQuestion.time) * 30);
      setScore((s) => s + pts);
    } else {
      const newLives = lives - 1;
      setLives(newLives);
      setJustLostLife(true);
      if (newLives <= 0) {
        setHistory((h) => [...h, { ...currentQuestion, selectedOption: optIdx, isCorrect, pointsEarned: 0 }]);
        setTimeout(() => setGameState('eliminated'), 2000);
        return;
      }
    }
    setHistory((h) => [...h, { ...currentQuestion, selectedOption: optIdx, isCorrect, pointsEarned: pts }]);
    setTimeout(advance, 1600);
  };

  const advance = () => {
    if (currentIndex + 1 < quiz.questions.length) {
      setCurrentIndex((i) => i + 1);
    } else {
      setGameState('completed');
      saveGameScore(pin, { nickname, score, lives, totalQuestions: quiz.questions.length });
    }
  };

  const restart = () => {
    setCurrentIndex(0); setLives(maxLives); setScore(0);
    setHistory([]); setSelectedOption(null); setIsLocked(false); setGameState('playing');
  };

  // ── Eliminated ──
  if (gameState === 'eliminated') {
    return (
      <main className="page-container center-page">
        <div className="results-card" style={{ maxWidth: '500px', margin: '0 auto' }}>
          <div style={{ fontSize: '4rem', margin: '0 auto 1rem', textAlign: 'center' }}>💀</div>
          <h2 className="results-title" style={{ color: '#f87171' }}>Eliminated!</h2>
          <p className="results-subtitle">{nickname}, you ran out of lives after answering {history.length} question{history.length !== 1 ? 's' : ''}.</p>
          <div className="results-score-box">
            <div className="results-stat"><strong>{score}</strong><span>Points Banked</span></div>
            <div className="results-stat"><strong>{history.filter(h => h.isCorrect).length}/{history.length}</strong><span>Correct</span></div>
            <div className="results-stat"><strong>0</strong><span>Lives Left ❤️</span></div>
          </div>
          <div className="results-actions">
            <button className="button button-primary" onClick={restart}><RotateCcw size={16} /><span>Try Again</span></button>
            <button className="button button-secondary" onClick={() => navigate('/')}><ArrowLeft size={16} /><span>Home</span></button>
          </div>
        </div>
      </main>
    );
  }

  // ── Completed (survived!) ──
  if (gameState === 'completed') {
    const correct = history.filter((h) => h.isCorrect).length;
    return (
      <main className="page-container">
        <div className="results-card">
          <div style={{ fontSize: '4rem', textAlign: 'center', margin: '0 auto 1rem' }}>🏆</div>
          <h2 className="results-title">You Survived!</h2>
          <p className="results-subtitle">Outstanding, <strong>{nickname}</strong>! You conquered all {quiz.questions.length} questions.</p>
          <div className="results-score-box">
            <div className="results-stat"><strong>{score}</strong><span>Points Earned</span></div>
            <div className="results-stat"><strong>{correct}/{quiz.questions.length}</strong><span>Correct</span></div>
            <div className="results-stat"><strong>{'❤️'.repeat(lives)}</strong><span>{lives} Life/Lives Left</span></div>
          </div>
          <div className="results-actions">
            <button className="button button-primary" onClick={restart}><RotateCcw size={16} /><span>Play Again</span></button>
            <button className="button button-secondary" onClick={() => navigate('/')}><ArrowLeft size={16} /><span>Home</span></button>
          </div>
        </div>
      </main>
    );
  }

  // ── Active question ──
  const pct = Math.max(0, (timeLeft / currentQuestion.time) * 100);
  let timerColor = '#38bdf8';
  if (pct < 30) timerColor = '#ef4444';
  else if (pct < 60) timerColor = '#f59e0b';

  return (
    <main className="arena-wrapper">
      <div className="arena-topbar">
        <div className="arena-meta">
          <Link to="/" className="back-link" style={{ margin: 0 }}><ArrowLeft size={16} /><span>Quit</span></Link>
          <span className="badge-pill">{quiz.category}</span>
          <span className="mode-tag-inline"><Shield size={14} /> Survival</span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div className={`survival-lives-display ${justLostLife ? 'life-lost' : ''}`}>
            {Array.from({ length: maxLives }).map((_, i) => (
              <span key={i} className={`life-icon ${i < lives ? 'alive' : 'dead'}`}>
                {i < lives ? '❤️' : '🖤'}
              </span>
            ))}
          </div>
          <div className="arena-score-pill"><Zap size={15} /><span>{score} PTS</span></div>
        </div>
      </div>

      <div className="timer-container">
        <div className="timer-fill" style={{ width: `${pct}%`, backgroundColor: timerColor }} />
      </div>

      <QuestionCard
        question={currentQuestion}
        index={currentIndex}
        total={quiz.questions.length}
        timeLeft={timeLeft}
        selectedOption={selectedOption}
        isLocked={isLocked}
        onSelect={onSelect}
        onAdvance={advance}
      />
    </main>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  Shared QuestionCard component
// ═══════════════════════════════════════════════════════════════════════════════
function QuestionCard({ question, index, total, timeLeft, selectedOption, isLocked, onSelect, onAdvance, accentColor }) {
  return (
    <div className="arena-card">
      <div className="arena-question-header">
        <span className="question-index-tag">Question {index + 1} of {total}</span>
        <div className="question-points-tag">
          <Clock size={14} />
          <span>{Math.ceil(timeLeft)}s</span>
          <span style={{ margin: '0 4px', opacity: 0.4 }}>•</span>
          <Trophy size={14} />
          <span>{question.points} pts</span>
        </div>
      </div>

      {/* Question image */}
      {question.imageDataUrl && (
        <div className="arena-question-image-wrap">
          <img src={question.imageDataUrl} alt="Question" className="arena-question-image" />
        </div>
      )}

      <h2 className="arena-question-text">{question.text || <em style={{ color: 'var(--text-dim)', fontStyle: 'normal' }}>See image above</em>}</h2>

      <div className="arena-options-grid">
        {question.options.map((option, optIdx) => {
          if (!option) return null;
          const letter = ['A', 'B', 'C', 'D'][optIdx];
          const isSelected = selectedOption === optIdx;
          const isCorrectAnswer = optIdx === question.correctAnswer;

          let cls = 'arena-option-btn';
          if (isLocked) {
            if (isCorrectAnswer) cls += ' correct';
            else if (isSelected) cls += ' incorrect';
          } else if (isSelected) cls += ' selected';

          return (
            <button key={optIdx} className={cls} disabled={isLocked} onClick={() => onSelect(optIdx)}>
              <div className="arena-option-badge">{letter}</div>
              <span style={{ flex: 1, paddingRight: '0.5rem' }}>{option}</span>
              {isLocked && isCorrectAnswer && <div className="arena-status-icon correct"><Check size={16} /></div>}
              {isLocked && isSelected && !isCorrectAnswer && <div className="arena-status-icon incorrect"><X size={16} /></div>}
            </button>
          );
        })}
      </div>

      {isLocked && (
        <div className="arena-footer-bar">
          {selectedOption === -1 ? (
            <div className="feedback-message feedback-incorrect"><Clock size={18} /><span>Time&apos;s Up!</span></div>
          ) : selectedOption === question.correctAnswer ? (
            <div className="feedback-message feedback-correct"><CheckCircle size={18} /><span>Correct!</span></div>
          ) : (
            <div className="feedback-message feedback-incorrect"><XCircle size={18} /><span>Incorrect! Correct answer highlighted.</span></div>
          )}
          <button className="button button-secondary btn-sm" onClick={onAdvance}>
            <span>Next</span><ArrowRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  Ready / Setup screen — handles mode-specific lobby
// ═══════════════════════════════════════════════════════════════════════════════
function ReadyScreen({ quiz, pin, onStart }) {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState('');
  const totalPoints = quiz.questions.reduce((s, q) => s + (q.points || 0), 0);
  const totalTime = quiz.questions.reduce((s, q) => s + (q.time || 0), 0);

  const modeIcons = {
    'Solo': <Sword size={28} />,
    'Team vs Team': <Users size={28} />,
    'Survival': <Shield size={28} />,
  };

  return (
    <main className="page-container center-page">
      <div className="join-card" style={{ maxWidth: '560px' }}>
        <Link to="/" className="back-link"><ArrowLeft size={18} /><span>Leave</span></Link>

        <div className="join-header">
          <div className="join-icon">{modeIcons[quiz.gameMode] || <Trophy size={28} />}</div>
          <div style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 700, background: 'rgba(139,92,246,0.15)', color: '#c084fc', marginBottom: '0.5rem' }}>
            {quiz.gameMode.toUpperCase()} • {quiz.category}
          </div>
          <h2 style={{ marginTop: '0.5rem' }}>{quiz.title}</h2>
          {quiz.gameMode === 'Survival' && (
            <p style={{ color: '#f87171', fontWeight: 600, fontSize: '0.9rem', marginTop: '0.35rem' }}>
              Starting with {'❤️'.repeat(quiz.survivalLives ?? 3)} — don&apos;t lose them all!
            </p>
          )}
        </div>

        {/* Team list for Team vs Team */}
        {quiz.gameMode === 'Team vs Team' && quiz.teams?.length > 0 && (
          <div className="ready-team-list">
            {quiz.teams.map((team, i) => {
              const col = TEAM_COLORS[(team.colorIndex ?? i) % TEAM_COLORS.length];
              return (
                <div key={team.id} className="ready-team-row" style={{ background: col.bg, borderColor: col.border, color: col.accent }}>
                  <Users size={14} />
                  <span>{team.name}</span>
                </div>
              );
            })}
          </div>
        )}

        <div className="preview-stats" style={{ margin: '1.25rem 0 1.5rem' }}>
          <div><strong>{quiz.questions.length}</strong><span>Questions</span></div>
          <div><strong>{totalPoints}</strong><span>Max Points</span></div>
          <div><strong>{totalTime}s</strong><span>Est. Time</span></div>
        </div>

        {/* Nickname only for Solo and Survival */}
        {quiz.gameMode !== 'Team vs Team' && (
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label htmlFor="ready-nickname">Your Nickname</label>
            <input
              id="ready-nickname"
              className="text-input"
              type="text"
              placeholder="e.g. MasterCoder"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={30}
            />
          </div>
        )}

        <button
          className="button button-primary btn-block"
          onClick={() => onStart(nickname || 'Player')}
        >
          <Zap size={18} />
          <span>Start {quiz.gameMode === 'Team vs Team' ? 'Team Battle' : quiz.gameMode === 'Survival' ? 'Survival Run' : 'Solo Challenge'}</span>
        </button>
      </div>
    </main>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  Main router component
// ═══════════════════════════════════════════════════════════════════════════════
export default function PlayQuiz() {
  const { pin } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [started, setStarted] = useState(false);
  const [nickname, setNickname] = useState(location.state?.nickname || 'Player');

  useEffect(() => {
    const found = getQuizByPin(pin);
    setQuiz(found);
  }, [pin]);

  if (!quiz) {
    return (
      <main className="page-container center-page">
        <div className="join-card" style={{ textAlign: 'center' }}>
          <div className="join-header">
            <div className="join-icon" style={{ background: 'rgba(239,68,68,0.2)', color: '#f87171' }}>
              <XCircle size={30} />
            </div>
            <h2>Challenge Not Found</h2>
            <p>No active battle corresponds to PIN: <strong>{pin}</strong></p>
          </div>
          <button className="button button-primary btn-block" onClick={() => navigate('/join')}>
            <ArrowLeft size={16} /><span>Try Another PIN</span>
          </button>
        </div>
      </main>
    );
  }

  if (!started) {
    return (
      <ReadyScreen
        quiz={quiz}
        pin={pin}
        onStart={(nick) => { setNickname(nick); setStarted(true); }}
      />
    );
  }

  // Route to correct mode
  if (quiz.gameMode === 'Team vs Team') return <TeamArena quiz={quiz} pin={pin} />;
  if (quiz.gameMode === 'Survival') return <SurvivalArena quiz={quiz} pin={pin} nickname={nickname} />;
  return <SoloArena quiz={quiz} pin={pin} nickname={nickname} />;
}
