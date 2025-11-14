import React, { useMemo } from 'react';
import { Edit, Trash2, Inbox, Clock, Repeat } from 'lucide-react';
import EmptyState from './EmptyState';

const CardGrid = ({ filteredCards, setEditingCard, deleteCardWithSync, subjects }) => {
  const subjectMap = useMemo(() => new Map(subjects.map(s => [s.id, s.name])), [subjects]);

  if (!filteredCards || filteredCards.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title="Aucune flashcard trouvée"
        message="Commencez par ajouter une nouvelle carte ou ajustez vos filtres."
      />
    );
  }

  return (
    <div className="card-grid">
      {filteredCards.map(card => (
        <div key={card.id} className="flashcard">
          <div className="flashcard-header">
            <span className="subject-badge">
              {subjectMap.get(card.subject_id) || 'N/A'}
            </span>
            <div className="flashcard-actions">
              <button onClick={() => setEditingCard(card)} className="icon-btn" title="Modifier">
                <Edit size={16} />
              </button>
              <button onClick={() => deleteCardWithSync(card.id)} className="icon-btn danger" title="Supprimer">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
          <div className="flashcard-q">{card.front}</div>
          <div className="flashcard-a">{card.back}</div>
          <div className="flashcard-footer">
            <div className="flex items-center gap-2">
              <Clock size={12} />
              <span>Proch. révision: {card.next_review_date ? new Date(card.next_review_date).toLocaleDateString('fr-FR') : 'Jamais'}</span>
            </div>
            <div className="flex items-center gap-2">
               <Repeat size={12} />
               <span>Révisions: {card.review_count || 0}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CardGrid;
