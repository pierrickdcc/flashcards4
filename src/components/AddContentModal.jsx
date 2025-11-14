import React from 'react';
import { useUIState } from '../context/UIStateContext';
import ModalWrapper from './ModalWrapper';
import { Plus, Book, FileInput } from 'lucide-react';

const AddContentModal = () => {
  const {
    showAddContentModal,
    setShowAddContentModal,
    setShowAddCardModal,
    setShowAddCourseModal,
    setShowBulkAddModal,
  } = useUIState();

  const handleAction = (action) => {
    setShowAddContentModal(false);
    action(true);
  };

  return (
    <ModalWrapper
      isOpen={showAddContentModal}
      title="Ajouter du contenu"
      onClose={() => setShowAddContentModal(false)}
    >
      <div className="actions-grid" style={{ flexDirection: 'column' }}>
        <a href="#" onClick={(e) => { e.preventDefault(); handleAction(setShowAddCardModal); }} className="action-card">
          <div className="action-card-icon"><Plus size={20} /></div>
          <div className="action-card-text">
            <h3>Ajouter une Carte</h3>
            <p>Créer une nouvelle flashcard manuellement.</p>
          </div>
        </a>
        <a href="#" onClick={(e) => { e.preventDefault(); handleAction(setShowBulkAddModal); }} className="action-card">
          <div className="action-card-icon"><FileInput size={20} /></div>
          <div className="action-card-text">
            <h3>Ajout en Masse</h3>
            <p>Importer plusieurs cartes depuis un fichier.</p>
          </div>
        </a>
        <a href="#" onClick={(e) => { e.preventDefault(); handleAction(setShowAddCourseModal); }} className="action-card">
          <div className="action-card-icon"><Book size={20} /></div>
          <div className="action-card-text">
            <h3>Ajouter un Cours</h3>
            <p>Créer une nouvelle page de cours.</p>
          </div>
        </a>
      </div>
    </ModalWrapper>
  );
};

export default AddContentModal;
