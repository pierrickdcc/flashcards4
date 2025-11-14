import React, { useMemo } from 'react';
import { Edit, Trash2, Inbox, Clock, Zap } from 'lucide-react';
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
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {filteredCards.map(card => (
        <div key={card.id} className="bg-card border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between p-4">
          <div>
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-1 rounded-full">
                {subjectMap.get(card.subject_id) || 'N/A'}
              </span>
               <div className="flex gap-1">
                <button onClick={() => alert('La modification n\'est possible que depuis la vue en liste.')} className="icon-btn-sm" title="Modifier">
                  <Edit size={14} />
                </button>
                <button onClick={() => deleteCardWithSync(card.id)} className="icon-btn-sm text-red-500 hover:text-red-700" title="Supprimer">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <p className="font-semibold text-card-foreground mb-1">{card.front}</p>
            <p className="text-sm text-muted-foreground">{card.back}</p>
          </div>
          <div className="flex justify-between items-center mt-4 pt-2 border-t border-border text-xs text-muted-foreground">
             <div className="flex items-center gap-1">
               <Clock size={12} />
               <span>{card.next_review_date ? new Date(card.next_review_date).toLocaleDateString('fr-FR') : 'Jamais'}</span>
             </div>
             <div className="flex items-center gap-1">
               <Zap size={12} />
               <span>Facilité: {card.ease_factor ? `${Math.round(card.ease_factor * 100)}%` : 'N/A'}</span>
             </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CardGrid;
