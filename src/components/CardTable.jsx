
import React, { useMemo } from 'react';
import { Edit, Trash2, Check, X, Inbox } from 'lucide-react';
import EmptyState from './EmptyState';

const CardTable = ({
  filteredCards,
  editingCard,
  setEditingCard,
  updateCardWithSync,
  deleteCardWithSync,
  subjects
}) => {
  const subjectMap = useMemo(() => new Map(subjects.map(s => [s.id, s.name])), [subjects]);

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
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            {['Question', 'Réponse', 'Matière', 'Prochaine', 'Révisions', 'Actions'].map((header) => (
              <th key={header}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredCards.map((card) => (
            <tr key={card.id}>
              <td>
                {editingCard?.id === card.id ? (
                  <input
                    value={editingCard.question}
                    onChange={(e) => setEditingCard({ ...editingCard, question: e.target.value })}
                    className="input"
                  />
                ) : (
                  <span>{card.question}</span>
                )}
              </td>
              <td>
                {editingCard?.id === card.id ? (
                  <input
                    value={editingCard.answer}
                    onChange={(e) => setEditingCard({ ...editingCard, answer: e.target.value })}
                    className="input"
                  />
                ) : (
                  <span>{card.answer}</span>
                )}
              </td>
              <td>
                {editingCard?.id === card.id ? (
                  <select
                    value={editingCard.subject_id}
                    onChange={(e) => setEditingCard({ ...editingCard, subject_id: e.target.value })}
                    className="select"
                  >
                    {(subjects || []).map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                ) : (
                  <span className="subject-badge">
                    {subjectMap.get(card.subject_id) || 'N/A'}
                  </span>
                )}
              </td>
              <td>
                {card.nextReview && !isNaN(new Date(card.nextReview)) ? new Date(card.nextReview).toLocaleDateString('fr-FR') : 'Jamais'}
              </td>
              <td className="text-center">
                {card.reviewCount}
              </td>
              <td>
                <div className="actions-cell">
                  {editingCard?.id === card.id ? (
                    <>
                      <button onClick={() => updateCardWithSync(card.id, editingCard)} className="icon-btn" style={{ color: '#10b981' }}>
                        <Check size={16} />
                      </button>
                      <button onClick={() => setEditingCard(null)} className="icon-btn">
                        <X size={16} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => setEditingCard(card)} className="icon-btn">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => deleteCardWithSync(card.id)} className="icon-btn" style={{ color: '#ef4444' }}>
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CardTable;
