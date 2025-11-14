import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUIState } from '../context/UIStateContext';
import { BookOpen, Search, Plus, User, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-white/10 transition-colors" title="Changer de thème">
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
};

const Header = () => {
  const { session } = useAuth();
  const {
    setShowConfigModal,
    setShowAddCardModal,
    setShowAddCourseModal,
    setShowAddMemoModal, // Assuming this will be added to UIStateContext
    setShowSignOutModal,
    searchTerm,
    debouncedSetSearchTerm,
  } = useUIState();

  const [activeMenu, setActiveMenu] = useState(null); // 'new' or 'user'
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('search-input')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const menuVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
  };

  const handleMenuClick = (menu) => {
    setActiveMenu(activeMenu === menu ? null : menu);
  };

  const handleActionClick = (action) => {
    action(true);
    setActiveMenu(null);
  }

  return (
    <header className="sticky top-0 z-50 bg-background-glass/80 backdrop-blur-xl border-b border-border">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <BookOpen className="text-primary" size={24} />
          <span className="logo-text text-xl font-bold">Flashcards Pro</span>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-lg">
          <div className="relative flex items-center">
            <Search className="absolute left-4 text-muted-foreground" size={18} />
            <input
              id="search-input"
              type="text"
              placeholder="Rechercher... (⌘K)"
              className="w-full bg-white/5 border border-border rounded-lg pl-11 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
              defaultValue={searchTerm}
              onChange={(e) => debouncedSetSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2" ref={menuRef}>
          <ThemeToggle />

          {/* New Button */}
          <div className="relative">
            <button
              className="btn-primary inline-flex items-center gap-2 px-4 py-2 rounded-lg"
              onClick={() => handleMenuClick('new')}
            >
              <Plus size={18} />
              <span className="text-sm font-semibold">Nouveau</span>
            </button>
            <AnimatePresence>
              {activeMenu === 'new' && (
                <motion.div
                  variants={menuVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="absolute top-full right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg p-2"
                >
                  <button className="w-full text-left px-3 py-2 text-sm rounded hover:bg-white/10" onClick={() => handleActionClick(setShowAddCardModal)}>Ajouter une carte</button>
                  <button className="w-full text-left px-3 py-2 text-sm rounded hover:bg-white/10" onClick={() => handleActionClick(setShowAddCourseModal)}>Ajouter un cours</button>
                  <button className="w-full text-left px-3 py-2 text-sm rounded hover:bg-white/10" onClick={() => handleActionClick(setShowAddMemoModal)}>Ajouter un mémo</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Avatar */}
          <div className="relative">
            <button
              className="w-9 h-9 rounded-full bg-primary-gradient flex items-center justify-center text-white font-semibold"
              onClick={() => handleMenuClick('user')}
            >
              <User size={18} />
            </button>
            <AnimatePresence>
              {activeMenu === 'user' && (
                <motion.div
                  variants={menuVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="absolute top-full right-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-lg p-2"
                >
                  <div className="px-3 py-2 border-b border-border mb-2">
                    <p className="text-sm font-semibold text-card-foreground truncate">{session?.user?.email}</p>
                  </div>
                  <button className="w-full text-left px-3 py-2 text-sm rounded hover:bg-white/10" onClick={() => handleActionClick(setShowConfigModal)}>Configuration</button>
                  <button className="w-full text-left px-3 py-2 text-sm rounded hover:bg-white/10" onClick={() => handleActionClick(setShowSignOutModal)}>Déconnexion</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;