import React from 'react';
import { User } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { Link } from 'react-router-dom';

const AppHeader = () => {
  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">
          {/* You can add a logo SVG here if you have one */}
          <span className="logo-text">Flashcards Pro</span>
        </Link>
        <div className="header-actions">
          <ThemeToggle />
          <button className="avatar">
            <User size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
