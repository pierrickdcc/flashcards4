
import React, { useState, useEffect } from 'react';
import { useDataSync } from '../context/DataSyncContext';
import { DEFAULT_SUBJECT } from '../constants/app';
import ModalWrapper from './ModalWrapper';

const AddCourseModal = ({ show, onClose }) => {
  const { subjects, addCourse } = useDataSync();
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [htmlContent, setHtmlContent] = useState('');

  useEffect(() => {
    if (show) {
      if (subjects && subjects.length > 0) {
        setSubject(subjects[0].name);
      } else {
        setSubject(DEFAULT_SUBJECT);
      }
    }
  }, [show, subjects]);

  const handleSubmit = () => {
    if (!title.trim() || !subject.trim() || !htmlContent.trim()) {
      alert('Veuillez remplir tous les champs.');
      return;
    }
    addCourse({ title, subject, content: htmlContent });
    onClose();
    setTitle('');
    setSubject(subjects && subjects.length > 0 ? subjects[0].name : DEFAULT_SUBJECT);
    setHtmlContent('');
  };

  return (
    <ModalWrapper isOpen={show} onClose={onClose} title="Ajouter un cours">
      <div className="space-y-4">
        <div>
          <label htmlFor="course-title" className="label">Titre du cours</label>
          <input
            id="course-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titre du cours"
            className="input"
          />
        </div>
        <div>
          <label htmlFor="course-subject" className="label">Matière</label>
          <select
            id="course-subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="select"
          >
            {subjects && subjects.length > 0 ? (
              subjects.map((s) => (
                <option key={s.id || s.name} value={s.name}>
                  {s.name}
                </option>
              ))
            ) : (
              <option value={DEFAULT_SUBJECT}>{DEFAULT_SUBJECT}</option>
            )}
          </select>
        </div>
        <div>
          <label htmlFor="course-content" className="label">Contenu HTML</label>
          <textarea
            id="course-content"
            value={htmlContent}
            onChange={(e) => setHtmlContent(e.target.value)}
            placeholder="Collez le contenu HTML ici"
            rows="10"
            className="input"
          />
        </div>
        <div className="flex gap-4 pt-2">
          <button
            onClick={handleSubmit}
            className="btn-primary"
          >
            Ajouter
          </button>
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            Annuler
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};

export default AddCourseModal;
