import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDataSync } from '../context/DataSyncContext';
import { db } from '../db';
import ModalWrapper from './ModalWrapper';

const ConfigModal = ({ show, onClose }) => {
  const { workspaceId, setWorkspaceId } = useAuth();
  const { syncToCloud } = useDataSync();
  const [localWorkspaceId, setLocalWorkspaceId] = useState(workspaceId);

  const handleSave = async () => {
    if (localWorkspaceId !== workspaceId) {
      setWorkspaceId(localWorkspaceId);
      await db.delete();
      await db.open();
      syncToCloud();
    }
    onClose();
  };

  return (
    <ModalWrapper isOpen={show} onClose={onClose} title="Configuration">
      <div>
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Workspace ID
          </label>
          <input
            type="text"
            value={localWorkspaceId}
            onChange={(e) => setLocalWorkspaceId(e.target.value)}
            placeholder="mon-groupe-revision"
            className="input-base mt-2"
          />
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Changer de Workspace ID videra vos données locales et synchronisera
            avec le nouveau groupe.
          </p>
        </div>
      </div>

      <div className="flex gap-4 mt-6">
        <button
          onClick={handleSave}
          className="btn-primary flex-1"
        >
          Enregistrer
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

export default ConfigModal;