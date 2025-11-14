import React from 'react';
import { Brain, Plus, FolderPlus } from 'lucide-react';
import { useUIState } from '../context/UIStateContext';

const Actions = ({ startReview, cardsToReviewCount, totalCards }) => {
  // 1. RETIREZ setReviewMode et setIsFreeReview d'ici
  const { setShowBulkAddModal, setShowAddSubjectModal } = useUIState();

  // 2. CETTE FONCTION EST LA SOURCE DU BUG
  /*
  const handleReviewClick = () => {
    if (cardsToReviewCount > 0) {
      setIsFreeReview(false);
    } else {
      setIsFreeReview(true);
    }
    setReviewMode(true);
  };
  */

  // 3. LA BONNE FONCTION est juste d'appeler la prop
  const handleReviewClick = () => {
    startReview();
  };

  // Le reste de votre logique pour 'isDisabled' est parfait
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
