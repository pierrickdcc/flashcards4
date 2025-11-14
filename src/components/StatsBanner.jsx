import React, { useMemo } from 'react';
import { useDataSync } from '../context/DataSyncContext';
import { Layers, Library, CalendarCheck } from 'lucide-react';

const StatsBanner = () => {
  const { cards, subjects } = useDataSync();

  const stats = useMemo(() => {
    if (!cards || !subjects) {
      return { totalCards: 0, totalSubjects: 0, dueToday: 0 };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueCards = cards.filter(c => c.nextReview && new Date(c.nextReview) <= today);

    return {
      totalCards: cards.length,
      totalSubjects: subjects.length,
      dueToday: dueCards.length,
    };
  }, [cards, subjects]);

  return (
    <div className="stats-banner">
      <div className="stats-banner-content">
        <div className="stat-item">
          <Layers className="stat-icon" />
          <div className="stat-text">
            <span className="stat-value">{stats.totalCards}</span>
            <span className="stat-label">Flashcards</span>
          </div>
        </div>
        <div className="stat-item">
          <Library className="stat-icon" />
          <div className="stat-text">
            <span className="stat-value">{stats.totalSubjects}</span>
            <span className="stat-label">Matières</span>
          </div>
        </div>
        <div className="stat-item">
          <CalendarCheck className="stat-icon" />
          <div className="stat-text">
            <span className="stat-value">{stats.dueToday}</span>
            <span className="stat-label">À réviser</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsBanner;
