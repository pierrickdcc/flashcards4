import React, { useState, useMemo, useEffect } from 'react';
import './CustomFlashcardStyles.css';
import { useDataSync } from '../context/DataSyncContext';
import { useUIState } from '../context/UIStateContext';
import CardGrid from './CardGrid';
import CardTable from './CardTable';
import Pagination from './Pagination';
import { LayoutGrid, List, Brain, Book } from 'lucide-react';
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
    <div className="page-container fc-page">
      <div className="page-header">
        <h1>Mes Flashcards</h1>
        <p>Gérez et révisez vos cartes.</p>
      </div>

      <div className="toolbar">
        <div className="toolbar-left">
          <button className="btn btn-primary" onClick={() => navigate('/review/setup')}>
            <Brain size={18} />
            <span>Commencer la révision</span>
          </button>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="btn btn-secondary" // Utilise le style de bouton pour le select
          >
            <option value="all">Toutes les matières</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="toolbar-right">
          <div className="view-toggle">
             <button onClick={() => setViewMode('grid')} className={`icon-btn ${viewMode === 'grid' ? 'active' : ''}`} title="Vue Grille">
                <LayoutGrid size={18} />
             </button>
             <button onClick={() => setViewMode('table')} className={`icon-btn ${viewMode === 'table' ? 'active' : ''}`} title="Vue Liste">
                <List size={18} />
             </button>
          </div>
        </div>
      </div>

      <div className="mt-8"> {/* Ajout d'un espace pour le contenu */}
        {viewMode === 'grid' ? (
          <CardGrid
            filteredCards={paginatedCards}
            setEditingCard={setEditingCard}
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
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default FlashcardsPage;
