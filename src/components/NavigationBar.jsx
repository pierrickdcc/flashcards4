import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, LayoutGrid, BookOpen, PenSquare, BarChart2 } from 'lucide-react';

const navLinks = [
  { to: '/', text: 'Accueil', icon: Home },
  { to: '/flashcards', text: 'Flashcards', icon: LayoutGrid },
  { to: '/courses', text: 'Cours', icon: BookOpen },
  { to: '/memos', text: 'Mémos', icon: PenSquare },
  { to: '/stats', text: 'Stats', icon: BarChart2 },
];

const NavigationBar = () => {
  return (
    <nav className="navigation-bar">
      <div className="navigation-content">
        {navLinks.map(({ to, text, icon: Icon }) => (
          <NavLink key={to} to={to} className="nav-link">
            <Icon size={20} />
            <span>{text}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default NavigationBar;
