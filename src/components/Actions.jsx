import React from 'react';
import { Brain, Plus, FolderPlus, FilePlus, BookPlus } from 'lucide-react';
import { useUIState } from '../context/UIStateContext';

const Actions = ({ startReview, cardsToReviewCount }) => {
  const { setShowBulkAddModal, setShowAddSubjectModal, setShowAddCardModal, setShowAddCourseModal } = useUIState();

  return (
    <div className="flex flex-wrap items-center gap-6 my-6">
      <button
        onClick={startReview}
        disabled={cardsToReviewCount === 0}
        title={cardsToReviewCount === 0 ? "Aucune carte à réviser" : ""}
        className="btn-primary"
      >
        <Brain size={18} /> Réviser ({cardsToReviewCount})
      </button>
      
      <button
        onClick={() => setShowAddCardModal(true)}
        className="btn-secondary"
      >
        <FilePlus size={18} /> Ajouter une carte
      </button>

      <button
        onClick={() => setShowAddCourseModal(true)}
        className="btn-secondary"
      >
        <BookPlus size={18} /> Ajouter un cours
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
