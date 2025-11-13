import React, { useState } from 'react';
import { useDataSync } from '../context/DataSyncContext';
import ModalWrapper from './ModalWrapper';

const AddSubjectModal = ({ show, onClose }) => {
  const { addSubject } = useDataSync();
  const [newSubject, setNewSubject] = useState('');

  const handleSubmit = () => {
    addSubject(newSubject);
    setNewSubject('');
    onClose();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <ModalWrapper isOpen={show} onClose={onClose} title="Nouvelle matière">
      <input
        type="text"
        value={newSubject}
        onChange={(e) => setNewSubject(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Nom de la matière"
        className="input-base"
      />
      <div className="flex gap-4 mt-6">
        <button
          onClick={handleSubmit}
          className="btn-primary flex-1"
        >
          Ajouter
        </button>
        <button
          onClick={onClose}
          className="btn-secondary flex-1"
        >
          Annuler
        </button>
      </div>
    </ModalWrapper>
  );
};

export default AddSubjectModal;