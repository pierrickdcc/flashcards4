import React, { useState, useMemo } from 'react';
import { useDataSync } from '../context/DataSyncContext';
import { useUIState } from '../context/UIStateContext';
import CardGrid from './CardGrid';
import CardTable from './CardTable';
import { LayoutGrid, List, Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FlashcardsPage = () => {
  const { cards, subjects, updateCard, deleteCard } = useDataSync();
  const { viewMode, setViewMode } = useUIState();
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [editingCard, setEditingCard] = useState(null);
  const navigate = useNavigate();

  const filteredCards = useMemo(() => {
    if (!cards) return [];
    if (selectedSubject === 'all') {
      return cards;
    }
    return cards.filter(card => card.subject_id === selectedSubject);
  }, [cards, selectedSubject]);

  const handleUpdateCard = async (cardId, updatedData) => {
    await updateCard(cardId, updatedData);
    setEditingCard(null); // Exit editing mode on success
  };

  return (
    <div className="main-content">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Mes Flashcards</h1>
          <p className="text-muted">Gérez et révisez vos cartes.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn btn-primary" onClick={() => navigate('/review/setup')}>
            <Brain size={18} />
            <span>Commencer la révision</span>
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="select"
          >
            <option value="all">Toutes les matières</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2 p-1 bg-background-glass rounded-lg">
          <button onClick={() => setViewMode('grid')} className={`icon-btn ${viewMode === 'grid' ? 'text-primary' : ''}`} aria-label="Switch to grid view">
            <LayoutGrid size={20} />
          </button>
          <button onClick={() => setViewMode('table')} className={`icon-btn ${viewMode === 'table' ? 'text-primary' : ''}`} aria-label="Switch to list view">
            <List size={20} />
          </button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <CardGrid
          filteredCards={filteredCards}
          setEditingCard={() => alert('Modification non disponible en vue grille.')}
          deleteCardWithSync={deleteCard}
          subjects={subjects}
        />
      ) : (
        <CardTable
          filteredCards={filteredCards}
          editingCard={editingCard}
          setEditingCard={setEditingCard}
          updateCardWithSync={handleUpdateCard}
          deleteCardWithSync={deleteCard}
          subjects={subjects}
        />
      )}
    </div>
  );
};

export default FlashcardsPage;
