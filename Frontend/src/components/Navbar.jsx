import { Trophy, Zap, Plus, LogIn } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <div className="brand-icon">
            <Trophy size={20} className="trophy-icon" />
          </div>
          <span className="brand-name">Quiz<span className="gradient-text">Forge</span></span>
        </Link>

        <nav className="navbar-links">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Home
          </NavLink>
          <NavLink to="/join" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Join Game
          </NavLink>
          <NavLink to="/create" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Create Quiz
          </NavLink>
        </nav>

        <div className="navbar-actions">
          <Link to="/join" className="btn btn-ghost">
            <LogIn size={16} />
            <span>Enter PIN</span>
          </Link>
          <Link to="/create" className="btn btn-nav-primary">
            <Plus size={16} />
            <span>Host Challenge</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
