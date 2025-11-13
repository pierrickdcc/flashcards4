import React from 'react';
import { Edit, Trash2 } from 'lucide-react';

const CardGrid = ({ filteredCards, setEditingCard, deleteCardWithSync }) => {
  if (filteredCards.length === 0) {
    return (
      <div className="text-center py-16 px-4 glass-card">
        <h3 className="text-xl font-semibold">Aucune carte à afficher</h3>
        <p className="opacity-70 mt-2">Ajoutez de nouvelles cartes ou sélectionnez une autre matière.</p>
      </div>
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
