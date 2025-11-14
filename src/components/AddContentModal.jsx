import React, { useState } from 'react';
import './CustomFlashcardStyles.css';
import { useUIState } from '../context/UIStateContext';
import { useDataSync } from '../context/DataSyncContext';
import ModalWrapper from './ModalWrapper';
import SubjectCombobox from './SubjectCombobox';
import { Plus, Layers, Book, X } from 'lucide-react';

const AddContentModal = () => {
  const { showAddContentModal, setShowAddContentModal } = useUIState();
  const [activeTab, setActiveTab] = useState('single'); // 'single', 'bulk', 'course'

  // Form state
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(null);

  const { subjects, addCard, addSubject } = useDataSync();

  const resetForm = () => {
    setFront('');
    setBack('');
    setSelectedSubject(null);
    setActiveTab('single');
  };

  const handleClose = () => {
    resetForm();
    setShowAddContentModal(false);
  };

  const handleAddCard = async (e) => {
    e.preventDefault();
    if (!selectedSubject) {
      console.error("Veuillez sélectionner ou créer une matière.");
      return;
    }

    let subjectId = selectedSubject.id;
    if (subjectId === null) {
      try {
        const newSubject = await addSubject({ name: selectedSubject.name });
        subjectId = newSubject.id;
      } catch (error) {
        console.error("Erreur lors de la création de la matière:", error);
        return;
      }
    }

    try {
      await addCard({ front, back, subject_id: subjectId });
      handleClose();
    } catch (error) {
      console.error("Erreur lors de l'ajout de la carte:", error);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'single':
        return (
          <form onSubmit={handleAddCard}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label htmlFor="front" className="label">Recto (Question)</label>
                <textarea id="front" className="textarea" value={front} onChange={(e) => setFront(e.target.value)} placeholder="Qu'est-ce que le Virtual DOM ?" required />
              </div>
              <div className="form-group">
                <label htmlFor="back" className="label">Verso (Réponse)</label>
                <textarea id="back" className="textarea" value={back} onChange={(e) => setBack(e.target.value)} placeholder="Une représentation en mémoire de l'UI..." required />
              </div>
            </div>
            <div className="form-group">
              <label className="label">Matière</label>
              <SubjectCombobox
                subjects={subjects || []}
                selectedSubject={selectedSubject}
                setSelectedSubject={setSelectedSubject}
              />
            </div>
          </form>
        );
      case 'bulk':
        return (
          <div>
            <div className="form-group">
              <label htmlFor="bulk-add" className="label">Coller votre liste</label>
              <textarea id="bulk-add" className="textarea" rows="8" placeholder="Question / Réponse / Matière\nQuestion 2 / Réponse 2 / Matière"></textarea>
              <p className="text-xs mt-2">Utilisez "/" pour séparer la question, la réponse et la matière. Une carte par ligne.</p>
            </div>
          </div>
        );
      case 'course':
        return (
           <div>
            <div className="form-group">
                <label htmlFor="course-title" className="label">Titre du cours</label>
                <input type="text" id="course-title" className="input" placeholder="Ex: Introduction à React" />
            </div>
            <div className="form-group">
                <label className="label">Matière</label>
                 <SubjectCombobox
                    subjects={subjects || []}
                    selectedSubject={null} // Gérer l'état pour le cours
                    setSelectedSubject={() => {}}
                  />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Le wrapper ModalWrapper utilise déjà un backdrop avec la classe .modal-backdrop
  // et un content .modal-content, donc on n'a pas besoin de les redéfinir ici.
  return (
    <ModalWrapper isOpen={showAddContentModal} onClose={handleClose} title="" className="fc-modal">
      <div className="modal-header">
        <h2>Que souhaitez-vous créer ?</h2>
        <button onClick={handleClose} className="icon-btn"><X size={20} /></button>
      </div>
      <div className="modal-body">
        <div className="tabs-nav">
          <button onClick={() => setActiveTab('single')} className={`tab-btn ${activeTab === 'single' ? 'active' : ''}`}>
            <Plus size={16} /> Carte unique
          </button>
          <button onClick={() => setActiveTab('bulk')} className={`tab-btn ${activeTab === 'bulk' ? 'active' : ''}`}>
            <Layers size={16} /> Importer en masse
          </button>
          <button onClick={() => setActiveTab('course')} className={`tab-btn ${activeTab === 'course' ? 'active' : ''}`}>
            <Book size={16} /> Cours
          </button>
        </div>
        {renderContent()}
      </div>
      <div className="modal-footer">
        <button onClick={handleClose} className="btn btn-secondary">Annuler</button>
        <button
          onClick={activeTab === 'single' ? handleAddCard : () => alert('Fonctionnalité à venir')}
          className="btn btn-primary"
        >
          <Plus size={18} />
          <span>{activeTab === 'single' ? 'Ajouter la carte' : 'Créer'}</span>
        </button>
      </div>
    </ModalWrapper>
  );
};

export default AddContentModal;
