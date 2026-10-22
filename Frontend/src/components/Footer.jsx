import { Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <div className="footer-logo">
            <Trophy size={18} />
            <span>Quiz<strong>Forge</strong></span>
          </div>
          <p className="footer-tagline">
            Empowering teams and classrooms with competitive, real-time knowledge battles.
          </p>
        </div>

        <div className="footer-links-group">
          <div className="footer-col">
            <h4>Platform</h4>
            <Link to="/">Home</Link>
            <Link to="/join">Join Game</Link>
            <Link to="/create">Create Challenge</Link>
          </div>
          <div className="footer-col">
            <h4>Features</h4>
            <a href="#speed">Speed Rounds</a>
            <a href="#teams">Team Battle</a>
            <a href="#stats">Live Leaderboards</a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} QuizForge. Crafted for interactive learning.</p>
      </div>
    </footer>
  );
}
