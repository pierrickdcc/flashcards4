import React from 'react';
import ModalWrapper from './ModalWrapper';

const DeleteSubjectModal = ({ show, onClose, onDelete, onReassign, subjectToDelete }) => {
  return (
    <ModalWrapper isOpen={show} onClose={onClose} title={`Supprimer : ${subjectToDelete}`}>
      <p className="text-slate-600 dark:text-slate-300 mb-6">
        Que souhaitez-vous faire des cartes associées à cette matière ?
      </p>
      <div className="flex flex-col gap-4">
        <button
          onClick={onDelete}
          className="btn-danger w-full"
        >
          Supprimer les cartes
        </button>
        <button
          onClick={onReassign}
          className="btn-primary w-full"
        >
          Réassigner à "Non classé"
        </button>
        <button
          onClick={onClose}
          className="btn-secondary w-full"
        >
          Annuler
        </button>
      </div>
    </ModalWrapper>
  );
};

export default DeleteSubjectModal;