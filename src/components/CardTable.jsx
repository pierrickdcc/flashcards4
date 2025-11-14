
import React, { useMemo } from 'react';
import { Edit, Trash2, Inbox } from 'lucide-react';
import EmptyState from './EmptyState';

const CardTable = ({
  filteredCards,
  setEditingCard,
  deleteCardWithSync,
  subjects
}) => {
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
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th>Question</th>
            <th>Réponse</th>
            <th>Matière</th>
            <th>Proch. révision</th>
            <th>Révisions</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredCards.map((card) => (
            <tr key={card.id}>
              <td className="q-cell">{card.front}</td>
              <td className="a-cell">{card.back}</td>
              <td><span className="subject-badge">{subjectMap.get(card.subject_id) || 'N/A'}</span></td>
              <td>{card.next_review_date ? new Date(card.next_review_date).toLocaleDateString('fr-FR') : 'Jamais'}</td>
              <td>{card.review_count || 0}</td>
              <td className="table-actions">
                <button onClick={() => setEditingCard(card)} className="icon-btn" title="Modifier">
                  <Edit size={16} />
                </button>
                <button onClick={() => deleteCardWithSync(card.id)} className="icon-btn danger" title="Supprimer">
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CardTable;
