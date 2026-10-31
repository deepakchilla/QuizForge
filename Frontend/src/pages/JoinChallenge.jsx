import { useState, useEffect } from 'react';
import { ArrowLeft, Play, Sparkles, User, Trophy, Zap, Clock, Plus, Users, Shield, Sword } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getQuizzes } from '../utils/quizStorage';

const CATEGORIES = ['All', 'Tech & Code', 'Science', 'General Knowledge', 'Mathematics', 'Entertainment', 'Sports'];

export default function JoinChallenge() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [nickname, setNickname] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedMode, setSelectedMode] = useState('All');

  useEffect(() => {
    const list = getQuizzes();
    setQuizzes(list);
  }, []);

  const handlePlayQuiz = (quiz) => {
    navigate(`/play/${quiz.id || quiz.pin}`, {
      state: { nickname: nickname.trim() || 'Player' },
    });
  };

  const filteredQuizzes = quizzes.filter((q) => {
    const catMatch = selectedCategory === 'All' || q.category === selectedCategory;
    const modeMatch = selectedMode === 'All' || q.gameMode === selectedMode;
    return catMatch && modeMatch;
  });

  const getModeIcon = (mode) => {
    if (mode === 'Team vs Team') return <Users size={13} />;
    if (mode === 'Survival') return <Shield size={13} />;
    return <Sword size={13} />;
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <Link to="/" className="back-link">
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </Link>
        <span className="badge-pill">GAME ARENA</span>
        <h1>Choose a Challenge</h1>
        <p>Select any quiz to jump straight into the battle. No PIN or codes needed!</p>
      </div>

      <div className="portal-toolbar">
        {/* Optional Nickname */}
        <div className="portal-nickname-box">
          <label htmlFor="portal-nickname">
            <User size={16} />
            <span>Player Nickname:</span>
          </label>
          <input
            id="portal-nickname"
            type="text"
            className="text-input"
            placeholder="e.g. MasterCoder (optional)"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={30}
          />
        </div>

        {/* Filter Chips */}
        <div className="portal-filters">
          <div className="filter-pill-group">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`filter-pill ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="filter-pill-group mode-filter-group">
            {['All', 'Solo', 'Team vs Team', 'Survival'].map((mode) => (
              <button
                key={mode}
                type="button"
                className={`filter-pill mode-pill ${selectedMode === mode ? 'active' : ''}`}
                onClick={() => setSelectedMode(mode)}
              >
                {mode !== 'All' && getModeIcon(mode)}
                <span>{mode}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredQuizzes.length === 0 ? (
        <div className="empty-challenges-card">
          <Trophy size={48} className="empty-icon" />
          <h3>No challenges match your filter</h3>
          <p>Try switching category filters or create a new challenge now!</p>
          <button
            className="button button-primary"
            onClick={() => navigate('/create')}
            style={{ marginTop: '1rem' }}
          >
            <Plus size={16} />
            <span>Create New Challenge</span>
          </button>
        </div>
      ) : (
        <div className="challenges-grid">
          {filteredQuizzes.map((quiz) => {
            const totalPoints = quiz.questions?.reduce(
              (sum, q) => sum + (Number(q.points) || 0),
              0
            ) || 0;
            const totalSecs = quiz.questions?.reduce(
              (sum, q) => sum + (Number(q.time) || 0),
              0
            ) || 0;

            return (
              <div className="challenge-card" key={quiz.id || quiz.pin}>
                <div className="challenge-card-top">
                  <span className="challenge-category-tag">{quiz.category}</span>
                  <span className="challenge-mode-badge">
                    {getModeIcon(quiz.gameMode)}
                    <span>{quiz.gameMode}</span>
                  </span>
                </div>

                <h3>{quiz.title}</h3>

                <div className="challenge-card-stats">
                  <span>
                    <Trophy size={14} /> {quiz.questions?.length || 0} Questions
                  </span>
                  <span>
                    <Zap size={14} /> {totalPoints} Pts
                  </span>
                  <span>
                    <Clock size={14} /> {totalSecs}s Total
                  </span>
                </div>

                <div className="challenge-card-actions">
                  <button
                    className="button button-primary btn-sm"
                    style={{ flex: 1 }}
                    onClick={() => handlePlayQuiz(quiz)}
                  >
                    <Play size={14} />
                    <span>Play Challenge</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="portal-footer-cta">
        <div>
          <h3>Want to make your own quiz?</h3>
          <p>Create custom questions, customize your teams, and launch your own battle arena.</p>
        </div>
        <button
          className="button button-secondary"
          onClick={() => navigate('/create')}
        >
          <Sparkles size={16} />
          <span>Host a Challenge</span>
        </button>
      </div>
    </div>
  );
}
