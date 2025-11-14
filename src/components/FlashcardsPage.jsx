import React, { useState, useMemo, useEffect } from 'react';
import { useDataSync } from '../context/DataSyncContext';
import { useUIState } from '../context/UIStateContext';
import CardGrid from './CardGrid';
import CardTable from './CardTable';
import Pagination from './Pagination';
import { LayoutGrid, List, Brain, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CARDS_PER_PAGE = 12;

const FlashcardsPage = () => {
  const { cards, subjects, updateCard, deleteCard } = useDataSync();
  const { viewMode, setViewMode } = useUIState();

  const [selectedSubject, setSelectedSubject] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingCard, setEditingCard] = useState(null);
  const navigate = useNavigate();

  const filteredCards = useMemo(() => {
    if (!cards) return [];
    if (selectedSubject === 'all') {
      return cards;
    }
    return cards.filter(card => card.subject_id === selectedSubject);
  }, [cards, selectedSubject]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedSubject]);

  const totalPages = Math.ceil(filteredCards.length / CARDS_PER_PAGE);
  const paginatedCards = filteredCards.slice(
    (currentPage - 1) * CARDS_PER_PAGE,
    currentPage * CARDS_PER_PAGE
  );

  const handleUpdateCard = async (cardId, updatedData) => {
    await updateCard(cardId, updatedData);
    setEditingCard(null);
  };

  return (
    <div className="main-content">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Mes Flashcards</h1>
          <p className="text-muted-foreground">Gérez et révisez vos cartes.</p>
        </div>
        <button className="btn btn-primary flex items-center gap-2" onClick={() => navigate('/review/setup')}>
          <Brain size={18} />
          <span>Commencer la révision</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex justify-between items-center mb-4 p-2 bg-card rounded-lg border border-border">
        <div className="flex items-center gap-4">
           <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="select"
          >
            <option value="all">Toutes les matières</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-1 p-1 bg-muted rounded-md">
          <button onClick={() => setViewMode('grid')} className={`icon-btn ${viewMode === 'grid' ? 'bg-background text-primary' : 'text-muted-foreground'}`} aria-label="Afficher en grille">
            <LayoutGrid size={20} />
          </button>
          <button onClick={() => setViewMode('table')} className={`icon-btn ${viewMode === 'table' ? 'bg-background text-primary' : 'text-muted-foreground'}`} aria-label="Afficher en liste">
            <List size={20} />
          </button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <CardGrid
          filteredCards={paginatedCards}
          setEditingCard={() => alert('Modification non disponible en vue grille.')}
          deleteCardWithSync={deleteCard}
          subjects={subjects}
        />
      ) : (
        <CardTable
          filteredCards={paginatedCards}
          editingCard={editingCard}
          setEditingCard={setEditingCard}
          updateCardWithSync={handleUpdateCard}
          deleteCardWithSync={deleteCard}
          subjects={subjects}
        />
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default FlashcardsPage;
