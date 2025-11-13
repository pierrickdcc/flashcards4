import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useDataSync } from '../context/DataSyncContext';
import ModalWrapper from './ModalWrapper';

const AddCardModal = ({ show, onClose }) => {
  const { subjects, addCard } = useDataSync();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [subject, setSubject] = useState('');

  useEffect(() => {
    if (show && subjects && subjects.length > 0 && !subject) {
      setSubject(subjects[0].name);
    }
  }, [show, subjects, subject]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) {
      toast.error('La question et la réponse sont obligatoires');
      return;
    }
    addCard({ question: question.trim(), answer: answer.trim(), subject });
    setQuestion('');
    setAnswer('');
    onClose();
  };

  return (
    <ModalWrapper isOpen={show} onClose={onClose} title="Ajouter une carte">
      <input
        type="text"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Question"
        className="input-base"
      />
      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Réponse"
        className="input-base mt-4 h-24"
      />
      <select
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        className="input-base mt-4"
      >
        {(subjects || []).map((s) => (
          <option key={s.id} value={s.name}>
            {s.name}
          </option>
        ))}
      </select>
      <div className="flex gap-4 pt-6">
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

export default AddCardModal;