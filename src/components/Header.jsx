import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUIState } from '../context/UIStateContext';
import { BookOpen, Search, Plus, User } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const Header = () => {
  const { session } = useAuth();
  
  const {
    setShowConfigModal,
    setShowAddCardModal,
    setShowAddCourseModal,
    setShowSignOutModal,
    searchTerm,
    debouncedSetSearchTerm,
  } = useUIState();
  const [showMenu, setShowMenu] = useState(false);
  const [showNewMenu, setShowNewMenu] = useState(false);

  useEffect(() => {
    // Raccourcis clavier globaux
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('search-input')?.focus();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        setShowAddCardModal(true);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault();
        setShowAddCourseModal(true);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === ',') {
        e.preventDefault();
        setShowConfigModal(true);
      }
      if (e.key === 'Escape') {
        setShowMenu(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setShowAddCardModal, setShowAddCourseModal, setShowConfigModal]);

  return (
    <header className="header">
      <div className="header-content">
        <div className="flex items-center gap-4">
          <div className="logo">
            <BookOpen className="text-primary" size={28} />
            <span className="logo-text">Flashcards Pro</span>
          </div>
        </div>

        <div className="search-bar">
          <Search className="search-icon" size={18} />
          <input
            id="search-input"
            type="text"
            placeholder="Rechercher... (Ctrl+K)"
            className="search-input"
            defaultValue={searchTerm}
            onChange={(e) => debouncedSetSearchTerm(e.target.value)}
          />
          <kbd className="kbd">⌘K</kbd>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <div className="relative">
            <button className="btn-primary" onClick={() => setShowNewMenu(!showNewMenu)}>
              <Plus size={20} />
              <span>Nouveau</span>
            </button>
            {showNewMenu && (
              <div className="dropdown-menu">
                <button className="dropdown-item" onClick={() => { setShowAddCardModal(true); setShowNewMenu(false); }}>
                  Ajouter une carte
                </button>
                <button className="dropdown-item" onClick={() => { setShowAddCourseModal(true); setShowNewMenu(false); }}>
                  Ajouter un cours
                </button>
              </div>
            )}
          </div>

          <div className="relative">
            <button className="avatar" onClick={() => setShowMenu(!showMenu)}>
              <User size={20} />
            </button>
            {showMenu && (
              <div className="dropdown-menu">
                <div className="dropdown-header">
                  <p className="font-semibold">{session?.user ? session.user.email : ''}</p>
                </div>
                <button className="dropdown-item" onClick={() => { setShowConfigModal(true); setShowMenu(false); }}>
                  Configuration
                </button>
                <button className="dropdown-item" onClick={() => { setShowSignOutModal(true); setShowMenu(false); }}>
                  Déconnexion
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
