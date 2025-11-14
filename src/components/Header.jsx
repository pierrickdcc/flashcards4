import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useUIState } from '../context/UIStateContext';
import { BookOpen, Search, Plus, User, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';


const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <button onClick={toggleTheme} className="icon-btn" title="Changer de thème">
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
};

const Header = () => {
  const { session } = useAuth();
  const {
    setShowAddCardModal,
    setShowSignOutModal,
    searchTerm,
    debouncedSetSearchTerm,
  } = useUIState();

  const navigate = useNavigate();

  return (
    <header className="header">
      <div className="header-content">

        {/* Logo */}
        <a href="/" className="logo" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
          <BookOpen size={24}/>
          <span className="logo-text">Flashcards Pro</span>
        </a>

        {/* Search Bar */}
        <div className="search-bar">
          <Search size={18} className="search-icon"/>
          <input
            type="text"
            placeholder="Rechercher... (Ctrl+K)"
            className="search-input"
            defaultValue={searchTerm}
            onChange={(e) => debouncedSetSearchTerm(e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className="header-actions">
          <ThemeToggle />

          <button
            className="btn btn-primary"
            onClick={() => setShowAddCardModal(true)}
          >
            <Plus size={18} />
            <span>Nouveau</span>
          </button>

          <button
            className="avatar"
            onClick={() => setShowSignOutModal(true)}
            title="Mon compte"
          >
            <User size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
