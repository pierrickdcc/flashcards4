import React, { useState, useEffect } from 'react';
import { useDataSync } from '../context/DataSyncContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2 } from 'lucide-react';

const colorPalette = ['yellow', 'blue', 'green', 'pink', 'purple', 'gray'];

const MemoModal = ({ show, onClose, memoToEdit }) => {
  const { courses, addMemo, updateMemoWithSync, deleteMemoWithSync } = useDataSync();

  const [content, setContent] = useState('');
  const [color, setColor] = useState('yellow');
  const [isPinned, setIsPinned] = useState(false);

  useEffect(() => {
    if (memoToEdit) {
      setContent(memoToEdit.content || '');
      setColor(memoToEdit.color || 'yellow');
      setIsPinned(memoToEdit.isPinned || false);
    } else {
      // Reset for new memo
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className="relative z-10 w-full max-w-lg bg-card border border-border rounded-2xl shadow-xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-semibold text-card-foreground">
                {memoToEdit ? 'Modifier le mémo' : 'Nouveau mémo'}
              </h2>
              <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10">
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Votre mémo..."
                className="w-full h-40 p-3 bg-white/5 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
              />
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Couleur :</span>
                {colorPalette.map(c => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${color === c ? 'border-white' : 'border-transparent'}`}
                    style={{ background: `var(--memo-${c}-border)` }}
                    title={c.charAt(0).toUpperCase() + c.slice(1)}
                  />
                ))}
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="w-4 h-4 rounded accent-primary"
                />
                <span className="text-sm font-medium">Épingler ce mémo</span>
              </label>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center p-6 border-t border-border bg-black/10">
              <div>
                {memoToEdit && (
                  <button onClick={handleDelete} className="btn-danger inline-flex items-center gap-2 px-4 py-2 rounded-lg">
                    <Trash2 size={16} />
                    <span>Supprimer</span>
                  </button>
                )}
              </div>
              <div className="flex gap-3">
                <button onClick={onClose} className="btn-secondary px-4 py-2 rounded-lg">Annuler</button>
                <button onClick={handleSave} className="btn-primary px-4 py-2 rounded-lg">Sauvegarder</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default MemoModal;