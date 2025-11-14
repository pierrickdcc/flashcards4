import React from 'react';
import { Brain, Plus, FolderPlus } from 'lucide-react';
import { useUIState } from '../context/UIStateContext';

const Actions = ({ startReview, cardsToReviewCount }) => {
  const { setShowBulkAddModal, setShowAddSubjectModal } = useUIState();

  const isDisabled = cardsToReviewCount === 0;

  return (
    <div className="flex flex-wrap items-center gap-4 my-8">
      <button
        onClick={startReview}
        disabled={isDisabled}
        title={isDisabled ? "Aucune carte à réviser pour le moment" : ""}
        className="btn-primary inline-flex items-center gap-2 px-5 py-3 rounded-lg text-base"
      >
        <Brain size={18} />
        <span>Réviser ({cardsToReviewCount})</span>
      </button>

      <button
        onClick={() => setShowBulkAddModal(true)}
        className="btn-secondary inline-flex items-center gap-2 px-5 py-3 rounded-lg text-base"
      >
        <Plus size={18} />
        <span>Ajout en masse</span>
      </button>

      <button
        onClick={() => setShowAddSubjectModal(true)}
        className="btn-secondary inline-flex items-center gap-2 px-5 py-3 rounded-lg text-base"
      >
        <FolderPlus size={18} />
        <span>Matière</span>
      </button>
    </div>
  );
};

export default Actions;
