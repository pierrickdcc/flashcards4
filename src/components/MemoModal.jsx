import React, { useState, useEffect } from 'react';
import { useDataSync } from '../context/DataSyncContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Pin } from 'lucide-react';

const colorPalette = ['yellow', 'blue', 'green', 'pink', 'purple', 'gray'];

const MemoModal = ({ show, onClose, memoToEdit }) => {
  const { addMemo, updateMemoWithSync, deleteMemoWithSync } = useDataSync();

  const [content, setContent] = useState('');
  const [color, setColor] = useState('yellow');
  const [isPinned, setIsPinned] = useState(false);

  useEffect(() => {
    if (memoToEdit) {
      setContent(memoToEdit.content || '');
      setColor(memoToEdit.color || 'yellow');
      setIsPinned(memoToEdit.isPinned || false);
    } else {
      setContent('');
      setColor('yellow');
      setIsPinned(false);
    }
  }, [memoToEdit, show]);

  const handleSave = () => {
    const memoData = { content, color, isPinned };
    if (memoToEdit) {
      updateMemoWithSync(memoToEdit.id, memoData);
    } else {
      addMemo(memoData);
    }
    onClose();
  };

  const handleDelete = () => {
    if (memoToEdit && window.confirm('Êtes-vous sûr de vouloir supprimer ce mémo ?')) {
      deleteMemoWithSync(memoToEdit.id);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <div className="modal-backdrop">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="modal-content"
          >
            <div className="modal-header">
              <h2>{memoToEdit ? 'Modifier le mémo' : 'Nouveau mémo'}</h2>
              <button onClick={onClose} className="icon-btn"><X size={20} /></button>
            </div>

            <div className="modal-body">
              <textarea
                placeholder="Votre mémo..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />

              <div className="color-palette">
                <span className="text-sm mr-2">Couleur :</span>
                {colorPalette.map(c => (
                  <button
                    key={c}
                    className={`color-dot ${color === c ? 'active' : ''}`}
                    style={{ background: `var(--memo-${c}-border)`, '--color-bg': `var(--memo-${c}-bg)` }}
                    title={c.charAt(0).toUpperCase() + c.slice(1)}
                    onClick={() => setColor(c)}
                  />
                ))}
              </div>

              <label className="flex items-center gap-3 cursor-pointer text-heading">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-primary"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                />
                Épingler ce mémo
              </label>
            </div>

            <div className="modal-footer">
              <div>
              {memoToEdit && (
                <button onClick={handleDelete} className="btn btn-danger" style={{padding: '0.6rem 1rem'}}>
                  <Trash2 size={16}/>
                </button>
              )}
              </div>
              <div className="flex gap-3">
                <button onClick={onClose} className="btn btn-secondary">Annuler</button>
                <button onClick={handleSave} className="btn btn-primary">Sauvegarder</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default MemoModal;
