import React from 'react';
import ModalWrapper from './ModalWrapper';

const SignOutConfirmationModal = ({ show, onClose, onConfirm }) => {
  return (
    <ModalWrapper isOpen={show} onClose={onClose} title="Confirmer la déconnexion">
      <p className="opacity-70 mb-6">
        Êtes-vous sûr de vouloir vous déconnecter ? Toutes les données locales non
        synchronisées seront perdues.
      </p>
      <div className="flex gap-4">
        <button
          onClick={onConfirm}
          className="btn-danger"
        >
          Se déconnecter
        </button>
        <button
          onClick={onClose}
          className="btn-secondary"
        >
          Annuler
        </button>
      </div>
    </ModalWrapper>
  );
};

export default SignOutConfirmationModal;
