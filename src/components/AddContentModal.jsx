import React, { useState } from 'react';
import { useUIState } from '../context/UIStateContext';
import { useDataSync } from '../context/DataSyncContext';
import ModalWrapper from './ModalWrapper';
import SubjectCombobox from './SubjectCombobox';
import { Plus, Book, Upload } from 'lucide-react';

const AddContentModal = () => {
  const { showAddContentModal, setShowAddContentModal } = useUIState();
  const [activeView, setActiveView] = useState('flashcard');
  const [activeTab, setActiveTab] = useState('single');

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
  }

  const handleAddCard = async (e) => {
    e.preventDefault();
    if (!selectedSubject) {
      // TODO: Show an error to the user
      console.error("No subject selected");
      return;
    }

    let subjectId = selectedSubject.id;

    // If id is null, it's a new subject
    if (subjectId === null) {
      try {
        const newSubject = await addSubject({ name: selectedSubject.name });
        subjectId = newSubject.id;
      } catch (error) {
        console.error("Failed to create new subject:", error);
        return; // Stop if subject creation fails
      }
    }

    try {
      await addCard({ front, back, subject_id: subjectId });
      handleClose();
    } catch (error) {
      console.error("Failed to add card:", error);
    }
  };

  const renderFlashcardView = () => (
    <div>
      <div className="tabs-container mb-4">
        <button onClick={() => setActiveTab('single')} className={`tab-button ${activeTab === 'single' ? 'active' : ''}`}>
          <Plus size={16} className="mr-2"/> Flashcard unique
        </button>
        <button onClick={() => setActiveTab('bulk')} className={`tab-button ${activeTab === 'bulk' ? 'active' : ''}`}>
          <Upload size={16} className="mr-2"/> Importer en masse
        </button>
      </div>

      {activeTab === 'single' ? (
        <form onSubmit={handleAddCard} className="flex flex-col gap-4">
          <textarea value={front} onChange={(e) => setFront(e.target.value)} placeholder="Recto..." className="textarea" rows="3" required />
          <textarea value={back} onChange={(e) => setBack(e.target.value)} placeholder="Verso..." className="textarea" rows="3" required />
          <SubjectCombobox
            subjects={subjects || []}
            selectedSubject={selectedSubject}
            setSelectedSubject={setSelectedSubject}
          />
          <div className="flex justify-end gap-2 mt-2">
            <button type="button" onClick={handleClose} className="btn btn-muted">Annuler</button>
            <button type="submit" className="btn btn-primary">Ajouter la carte</button>
          </div>
        </form>
      ) : (
        <div>
          <p className="text-sm text-muted-foreground mb-4">Importez un fichier CSV avec les colonnes "recto" et "verso".</p>
          <input type="file" className="input" />
           <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={handleClose} className="btn btn-muted">Annuler</button>
            <button type="submit" className="btn btn-primary" disabled>Importer</button>
          </div>
        </div>
      )}
    </div>
  );

  const renderCourseView = () => (
    <div>
      <p>Fonctionnalité de création de cours à venir.</p>
       <div className="flex justify-end gap-2 mt-4">
        <button type="button" onClick={handleClose} className="btn btn-muted">Annuler</button>
      </div>
    </div>
  );

  return (
    <ModalWrapper
      isOpen={showAddContentModal}
      onClose={handleClose}
      title="Que souhaitez-vous créer ?"
    >
      <div className="flex gap-2 border-b border-border mb-4">
        <button onClick={() => setActiveView('flashcard')} className={`view-button ${activeView === 'flashcard' ? 'active' : ''}`}>
          <Plus size={16} className="mr-2"/> Flashcard
        </button>
        <button onClick={() => setActiveView('course')} className={`view-button ${activeView === 'course' ? 'active' : ''}`}>
          <Book size={16} className="mr-2"/> Cours
        </button>
      </div>

      {activeView === 'flashcard' ? renderFlashcardView() : renderCourseView()}
    </ModalWrapper>
  );
};

export default AddContentModal;
