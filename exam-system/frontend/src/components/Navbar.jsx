import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, BookOpen } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-brand">
          <Link to="/" className="nav-logo">
            <BookOpen size={28} />
            <span>SmartExam</span>
          </Link>
        </div>
        <div className="nav-menu">
          {user ? (
            <div className="nav-links">
              <span className="nav-text">
                Welcome, {user.name} ({user.role})
              </span>
              <button onClick={handleLogout} className="btn btn-primary">
                <LogOut size={16} />
                Logout
              </button>
            </div>
          ) : (
            <div className="nav-links">
              <Link to="/login" className="nav-text">Login</Link>
              <Link to="/register" className="btn btn-primary">Register</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
