import React, { useState, useEffect } from 'react';
import ModalWrapper from './ModalWrapper';
import { useDataSync } from '../context/DataSyncContext';

const MemoModal = ({ isOpen, onClose, onSave, memoToEdit, onDelete }) => {
  const [content, setContent] = useState('');
  const [color, setColor] = useState('yellow');
  const [courseId, setCourseId] = useState(null);
  const [isPinned, setIsPinned] = useState(false);

  const { courses } = useDataSync();

  useEffect(() => {
    if (memoToEdit) {
      setContent(memoToEdit.content || '');
      setColor(memoToEdit.color || 'yellow');
      setCourseId(memoToEdit.course_id || null);
      setIsPinned(memoToEdit.is_pinned || false);
    } else {
      // Réinitialiser pour un nouveau mémo
      setContent('');
      setColor('yellow');
      setCourseId(null);
      setIsPinned(false);
    }
  }, [memoToEdit, isOpen]);

  const handleSave = () => {
    onSave({
      content,
      color,
      course_id: courseId,
      is_pinned: isPinned,
    });
    onClose();
  };

  const colorPalette = ['yellow', 'blue', 'green', 'pink', 'purple', 'gray'];

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={memoToEdit ? 'Modifier le mémo' : 'Nouveau mémo'}
    >
      <div className="space-y-4">
        <textarea
          className="w-full h-40 p-2 border rounded"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Votre mémo..."
        />

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {colorPalette.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-8 h-8 rounded-full border-2 ${color === c ? 'border-blue-500' : 'border-transparent'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
            />
            Épingler
          </label>
        </div>

        <div>
          <label htmlFor="course-select" className="block text-sm font-medium text-gray-700">
            Lier à un cours (optionnel)
          </label>
          <select
            id="course-select"
            value={courseId || ''}
            onChange={(e) => setCourseId(e.target.value || null)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="">Aucun cours</option>
            {courses?.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-between items-center mt-4">
          <div>
            {memoToEdit && (
              <button onClick={() => {
                if (window.confirm('Êtes-vous sûr de vouloir supprimer ce mémo ?')) {
                  onDelete(memoToEdit.id);
                  onClose();
                }
              }} className="btn-danger">
                Supprimer
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="btn-secondary">
              Annuler
            </button>
            <button onClick={handleSave} className="btn-primary">
              Sauvegarder
            </button>
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
};

export default MemoModal;
