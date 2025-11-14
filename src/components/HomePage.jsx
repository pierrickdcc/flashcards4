import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDataSync } from '../context/DataSyncContext';
import { useUIState } from '../context/UIStateContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Brain, Pin, Plus, Book, FileInput } from 'lucide-react';

const HomePage = () => {
  const { cards, memos } = useDataSync();
  const { setShowAddCardModal, setShowAddCourseModal, setEditingMemo } = useUIState();
  const navigate = useNavigate();

  const {
    dueCardsCount,
    forecast,
    pinnedMemos,
    difficultCards,
  } = useMemo(() => {
    if (!cards || !memos) return { dueCardsCount: 0, forecast: [], pinnedMemos: [], difficultCards: [] };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueCards = cards.filter(c => c.nextReview && new Date(c.nextReview) <= today);

    const forecastData = Array(7).fill(0).map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() + i);
      date.setHours(0, 0, 0, 0);
      const day = date.toLocaleDateString('fr-FR', { weekday: 'short' });
      const count = cards.filter(c => c.nextReview && new Date(c.nextReview).toDateString() === date.toDateString()).length;
      return { day, à_réviser: count };
    });

    const pinned = memos.filter(memo => memo.isPinned).slice(0, 3);

    const difficult = [...cards]
      .filter(c => c.reviewCount > 5 && c.easeFactor < 2.0) // Example logic for "difficult"
      .sort((a, b) => a.easeFactor - b.easeFactor)
      .slice(0, 5);

    return {
      dueCardsCount: dueCards.length,
      forecast: forecastData,
      pinnedMemos: pinned,
      difficultCards: difficult,
    };
  }, [cards, memos]);

  const handleStartReview = () => {
    navigate('/review/setup');
  };

  const handleMemoClick = (memo) => {
    setEditingMemo(memo);
    // Assuming a modal for memos exists and can be opened
    // e.g., setShowMemoModal(true);
  };

  return (
    <div className="main-content">
      <div className="welcome-header">
        <h1>Bonjour, Bienvenue !</h1>
        <p>Prêt à apprendre quelque chose de nouveau aujourd'hui ?</p>
      </div>

      <div className="hub-grid">
        {/* Review Card */}
        <div className="review-card">
          <div>
            <h2>À réviser aujourd'hui</h2>
            <div className="review-count">{dueCardsCount}</div>
            <p>cartes vous attendent.</p>
          </div>
          <button className="btn btn-primary" onClick={handleStartReview}>
            <Brain size={18} />
            <span>Commencer la révision</span>
          </button>
        </div>

        {/* Forecast Card */}
        <div className="forecast-card">
          <h2>Prévisions sur 7 jours</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={forecast} margin={{ top: 20, right: 20, left: -20, bottom: 5 }}>
              <XAxis dataKey="day" tick={{ fill: 'var(--text-color)', fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fill: 'var(--text-color)', fontSize: 12 }} />
              <Tooltip
                cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
                contentStyle={{ background: 'var(--background-body)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
              />
              <Bar dataKey="à_réviser" fill="var(--primary-color)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pinned Memos */}
        <div className="pinned-memos-container">
          <h2><Pin size={18} style={{ transform: 'rotate(45deg)' }}/> Mémos Épinglés</h2>
          <div className="pinned-memos-grid">
            {pinnedMemos.length > 0 ? pinnedMemos.map(memo => (
              <div key={memo.id} className={`memo-card memo-${memo.color}`} onClick={() => handleMemoClick(memo)}>
                <p>{memo.content}</p>
              </div>
            )) : <p className="text-sm">Aucun mémo épinglé pour le moment.</p>}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h2>Actions Rapides</h2>
          <div className="actions-grid">
            <a href="#" onClick={(e) => { e.preventDefault(); setShowAddCardModal(true); }} className="action-card">
              <div className="action-card-icon"><Plus size={20} /></div>
              <div className="action-card-text">
                <h3>Ajouter une Carte</h3>
                <p>Créer une nouvelle flashcard</p>
              </div>
            </a>
            <a href="#" onClick={(e) => { e.preventDefault(); /* setShowBulkAddModal(true); */ }} className="action-card">
              <div className="action-card-icon"><FileInput size={20} /></div>
              <div className="action-card-text">
                <h3>Ajout en Masse</h3>
                <p>Importer plusieurs cartes à la fois</p>
              </div>
            </a>
            <a href="#" onClick={(e) => { e.preventDefault(); setShowAddCourseModal(true); }} className="action-card">
              <div className="action-card-icon"><Book size={20} /></div>
              <div className="action-card-text">
                <h3>Ajouter un Cours</h3>
                <p>Créer une nouvelle page de cours</p>
              </div>
            </a>
          </div>
        </div>

        {/* Difficult Cards - Added as per request */}
        <div className="quick-actions" style={{ gridRow: '4 / 5' }}>
            <h2>Cartes Difficiles</h2>
            <div className="actions-grid">
                {difficultCards.length > 0 ? difficultCards.map(card => (
                    <div key={card.id} className="action-card" style={{ flex: '1 1 300px' }}>
                        <div className="action-card-text">
                            <h3 className="truncate">{card.question}</h3>
                            <p className="text-xs mt-1">Revue {card.reviewCount} fois</p>
                        </div>
                    </div>
                )) : <p className="text-sm">Aucune carte difficile identifiée.</p>}
            </div>
        </div>

      </div>
    </div>
  );
};

export default HomePage;
