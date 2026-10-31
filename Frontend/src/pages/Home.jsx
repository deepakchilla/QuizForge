import { useState, useEffect } from "react";
import {
  ArrowRight,
  Trophy,
  Users,
  Zap,
  Clock,
  Play,
  Flame,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getQuizzes } from "../utils/quizStorage";

function Home() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    const list = getQuizzes();
    setQuizzes(list);
  }, []);

  return (
    <main className="home-page">
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="pulse-dot" />
            THE NEXT LEVEL OF FRIENDLY COMPETITION
          </div>

          <h1>
            Create Challenges.
            <br />
            Build <span className="gradient-text">Champions.</span>
          </h1>

          <p className="hero-description">
            Bring your people together through quizzes, puzzles, and
            team challenges. Put your knowledge to the test and compete
            for the top spot.
          </p>

          <div className="hero-actions">
            <button
              className="button button-primary"
              onClick={() => navigate("/create")}
            >
              Create a Challenge <ArrowRight size={18} />
            </button>

            <button
              className="button button-secondary"
              onClick={() => navigate("/play")}
            >
              Play Challenges
            </button>
            <button
              className="button button-secondary"
              onClick={() => navigate("/auction")}
            >
              Auction Game
            </button>
          </div>

          <div className="hero-note">
            <Users size={17} />
            Built for clubs, teams, and curious minds.
          </div>
        </div>

        <div className="hero-visual">
          <div className="visual-glow" />

          <div className="floating-label floating-top">
            <Zap size={14} />
            <span>LIVE BATTLE</span>
          </div>

          <div className="preview-card">
            <div className="preview-top">
              <span className="preview-label">
                <Flame size={14} color="#f59e0b" />
                ARENA PREVIEW
              </span>
              <span className="round-label">ROUND 1 / 5</span>
            </div>

            <div className="trophy-container">
              <Trophy size={36} />
            </div>

            <span className="question-label">SPEED & STRATEGY</span>
            <h2>Coding & Web Tech Blitz</h2>
            <p className="preview-description">
              Fastest correct answers claim multiplier bonuses and the leaderboard top spot.
            </p>

            <div className="team-card">
              <div className="team-icon purple-icon">
                <Users size={18} />
              </div>
              <div className="team-details">
                <strong>Alpha Devs</strong>
                <span>Score: 2,450 pts</span>
              </div>
              <span className="ready-label">LOCKED IN</span>
            </div>

            <div className="team-card">
              <div className="team-icon orange-icon">
                <Zap size={18} />
              </div>
              <div className="team-details">
                <strong>Byte Brawlers</strong>
                <span>Score: 2,280 pts</span>
              </div>
              <span className="ready-label">READY</span>
            </div>

            <div className="preview-footer">
              <span>
                <Clock size={14} /> 15s Per Question
              </span>
              <span>
                <Trophy size={14} /> 500 Pts Available
              </span>
            </div>
          </div>

          <div className="floating-label floating-bottom">
            <Trophy size={14} />
            <span>INSTANT PLAY</span>
          </div>
        </div>
      </section>

      <section className="featured-challenges-section">
        <div className="section-header-block">
          <div>
            <h2>Explore Active Challenges</h2>
            <p>Jump directly into any quiz and start competing immediately.</p>
          </div>

          <button
            className="button button-secondary btn-sm"
            onClick={() => navigate("/create")}
          >
            <Sparkles size={15} />
            <span>Host New Challenge</span>
          </button>
        </div>

        <div className="challenges-grid">
          {quizzes.map((quiz) => {
            const totalPoints = quiz.questions?.reduce(
              (sum, q) => sum + (Number(q.points) || 0),
              0
            ) || 0;
            const totalSecs = quiz.questions?.reduce(
              (sum, q) => sum + (Number(q.time) || 0),
              0
            ) || 0;

            return (
              <div className="challenge-card" key={quiz.id}>
                <div className="challenge-card-top">
                  <span className="challenge-category-tag">{quiz.category}</span>
                  <span className="challenge-mode-badge">{quiz.gameMode}</span>
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
                    onClick={() => navigate(`/play/${quiz.id || quiz.pin}`)}
                  >
                    <Play size={14} />
                    <span>Play Challenge</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}

export default Home;
