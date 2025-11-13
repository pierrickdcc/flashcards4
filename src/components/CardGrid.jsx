import React from 'react';
import { Edit, Trash2, Inbox } from 'lucide-react';
import EmptyState from './EmptyState';

const CardGrid = ({ filteredCards, setEditingCard, deleteCardWithSync }) => {
  if (filteredCards.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title="Aucune carte à afficher"
        message="Ajoutez de nouvelles cartes ou modifiez vos filtres de recherche."
      />
    );
  }

  return (
    <div className="card-grid">
      {filteredCards.map(card => (
        <div key={card.id} className="glass-card flashcard">
          <div className="flashcard-header">
            <span className="subject-badge">{card.subject}</span>
            <div className="flex gap-2">
              <button onClick={() => setEditingCard(card)} className="icon-btn" title="Modifier">
                <Edit size={16} />
              </button>
              <button onClick={() => deleteCardWithSync(card.id)} className="icon-btn" style={{ color: '#ef4444' }} title="Supprimer">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
          <div className="flashcard-question">{card.question}</div>
          <div className="flashcard-answer">{card.answer}</div>
          <div className="flashcard-footer">
            <span className="text-xs opacity-60">Prochaine révision: {new Date(card.nextReview).toLocaleDateString('fr-FR')}</span>
            <span className="text-xs opacity-60">Révisions: {card.reviewCount}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CardGrid;
