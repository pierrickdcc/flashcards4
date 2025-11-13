import React from 'react';
import { Brain, Plus, FolderPlus, FilePlus, BookPlus } from 'lucide-react';
import { useUIState } from '../context/UIStateContext';

const Actions = ({ startReview, cardsToReviewCount, totalCards }) => {
  const { setShowBulkAddModal, setShowAddSubjectModal, setReviewMode, setIsFreeReview } = useUIState();

  const handleReviewClick = () => {
    if (cardsToReviewCount > 0) {
      setIsFreeReview(false);
    } else {
      setIsFreeReview(true);
    }
    setReviewMode(true);
  };

  const canReview = cardsToReviewCount > 0;
  const canDoFreeReview = cardsToReviewCount === 0 && totalCards > 0;
  const isDisabled = !canReview && !canDoFreeReview;

  return (
    <div className="flex flex-wrap items-center gap-6 my-6">
      <button
        onClick={handleReviewClick}
        disabled={isDisabled}
        title={isDisabled ? "Aucune carte à réviser" : ""}
        className="btn-primary"
      >
        <Brain size={18} /> {canReview ? `Réviser (${cardsToReviewCount})` : 'Révision Libre'}
      </button>

      <button
        onClick={() => setShowBulkAddModal(true)}
        className="btn-secondary"
      >
        <Plus size={18} /> Ajout en masse
      </button>

      <button
        onClick={() => setShowAddSubjectModal(true)}
        className="btn-secondary"
      >
        <FolderPlus size={18} /> Matière
      </button>
    </div>
  );
};

export default Actions;
