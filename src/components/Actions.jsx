import React from 'react';
import { Brain, Plus, FolderPlus, FilePlus, BookPlus } from 'lucide-react';
import { useUIState } from '../context/UIStateContext';

const Actions = ({ startReview, cardsToReviewCount }) => {
  const { setShowBulkAddModal, setShowAddSubjectModal, setShowAddCardModal, setShowAddCourseModal } = useUIState();

  const baseButtonClass = "flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900";
  const reviewButtonClass = "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed hover:shadow-lg hover:-translate-y-0.5 transform disabled:transform-none disabled:shadow-none";
  const secondaryButtonClass = "bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200";

  return (
    <div className="flex flex-wrap items-center gap-4 my-6">
      <button
        onClick={startReview}
        disabled={cardsToReviewCount === 0}
        title={cardsToReviewCount === 0 ? "Aucune carte à réviser" : ""}
        className={`${baseButtonClass} ${reviewButtonClass}`}
      >
        <Brain size={20} /> Réviser ({cardsToReviewCount})
      </button>
      
      <button
        onClick={() => setShowAddCardModal(true)}
        className={`${baseButtonClass} ${secondaryButtonClass}`}
      >
        <FilePlus size={20} /> Ajouter une carte
      </button>

      <button
        onClick={() => setShowAddCourseModal(true)}
        className={`${baseButtonClass} ${secondaryButtonClass}`}
      >
        <BookPlus size={20} /> Ajouter un cours
      </button>

      <button
        onClick={() => setShowBulkAddModal(true)}
        className={`${baseButtonClass} ${secondaryButtonClass}`}
      >
        <Plus size={20} /> Ajout en masse
      </button>

      <button
        onClick={() => setShowAddSubjectModal(true)}
        className={`${baseButtonClass} ${secondaryButtonClass}`}
      >
        <FolderPlus size={20} /> Matière
      </button>
    </div>
  );
};

export default Actions;