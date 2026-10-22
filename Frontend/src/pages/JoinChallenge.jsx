import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, KeyRound, Sparkles, User, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getQuizByPin, getQuizzes } from '../utils/quizStorage';

export default function JoinChallenge() {
  const navigate = useNavigate();
  const [pin, setPin] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [availableQuizzes, setAvailableQuizzes] = useState([]);

  useEffect(() => {
    const list = getQuizzes();
    setAvailableQuizzes(list);
  }, []);

  const handleJoin = (e) => {
    e.preventDefault();
    setError('');

    const cleanPin = pin.trim();
    if (!cleanPin || cleanPin.length !== 6) {
      setError('Please enter a valid 6-digit game PIN.');
      return;
    }

    const quiz = getQuizByPin(cleanPin);
    if (!quiz) {
      setError(`No challenge found with PIN "${cleanPin}". Please check the code or select an active challenge below.`);
      return;
    }

    navigate(`/play/${cleanPin}`, {
      state: { nickname: nickname.trim() || 'Player' },
    });
  };

  const handleSelectQuickPin = (quickPin) => {
    setPin(quickPin);
    setError('');
  };

  return (
    <div className="page-container center-page">
      <div className="join-card">
        <Link to="/" className="back-link">
          <ArrowLeft size={18} />
          <span>Back to Home</span>
        </Link>

        <div className="join-header">
          <div className="join-icon">
            <KeyRound size={28} />
          </div>
          <h2>Join a Challenge</h2>
          <p>Enter the 6-digit game PIN provided by your host.</p>
        </div>

        <form onSubmit={handleJoin} className="join-form">
          <div className="form-group">
            <label htmlFor="room-pin">Game PIN</label>
            <input
              id="room-pin"
              type="text"
              maxLength={6}
              className="text-input pin-input"
              placeholder="0 0 0 0 0 0"
              value={pin}
              onChange={(e) => {
                setPin(e.target.value.replace(/[^0-9]/g, ''));
                setError('');
              }}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="player-nickname">Player Nickname</label>
            <div className="input-with-icon">
              <User size={18} className="field-icon" />
              <input
                id="player-nickname"
                type="text"
                className="text-input with-icon"
                placeholder="e.g. MasterCoder"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={30}
              />
            </div>
          </div>

          {error && (
            <div className="form-error" role="alert" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <button type="submit" className="button button-primary btn-block">
            <span>Enter Arena</span>
            <ArrowRight size={18} />
          </button>
        </form>

        {availableQuizzes.length > 0 && (
          <div className="quick-pins-section">
            <div className="quick-pins-title">Or Choose an Active Challenge</div>
            <div className="quick-pins-list">
              {availableQuizzes.slice(0, 3).map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className="quick-pin-item"
                  onClick={() => handleSelectQuickPin(item.pin)}
                  title="Click to fill PIN"
                >
                  <span className="pin-title">{item.title}</span>
                  <span className="pin-code">{item.pin}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="join-footer-hint">
          <Sparkles size={16} />
          <span>Real-time score calculation and streak bonuses</span>
        </div>
      </div>
    </div>
  );
}
