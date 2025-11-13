import React, { useState } from 'react';
import { useDataSync } from '../context/DataSyncContext';
import ModalWrapper from './ModalWrapper';

const BulkAddModal = ({ show, onClose }) => {
  const { handleBulkAdd } = useDataSync();
  const [bulkAdd, setBulkAdd] = useState('');

  const handleSubmit = () => {
    handleBulkAdd(bulkAdd);
    setBulkAdd('');
    onClose();
  };

  return (
    <ModalWrapper isOpen={show} onClose={onClose} title="Ajouter des cartes en masse">
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
        Format :{' '}
        <code className="px-1.5 py-1 text-xs font-mono bg-slate-100 dark:bg-slate-900 rounded-md">
          Question / Réponse / Matière
        </code>
        <br />
        Une carte par ligne.
      </p>
      <textarea
        value={bulkAdd}
        onChange={(e) => setBulkAdd(e.target.value)}
        placeholder="Qu'est-ce qu'une cellule? / Unité de base du vivant / Sciences&#10;Capitale de la France? / Paris / Histoire"
        className="input h-80 font-mono text-sm"
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

export default BulkAddModal;