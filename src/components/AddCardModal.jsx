import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useDataSync } from '../context/DataSyncContext';
import ModalWrapper from './ModalWrapper';

const AddCardModal = ({ show, onClose, cardToEdit, onUpdate }) => {
  const { subjects, addCard } = useDataSync();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [subject, setSubject] = useState('');

  useEffect(() => {
    if (cardToEdit) {
      setQuestion(cardToEdit.question);
      setAnswer(cardToEdit.answer);
      setSubject(cardToEdit.subject);
    } else {
      setQuestion('');
      setAnswer('');
      setSubject(subjects && subjects.length > 0 ? subjects[0].name : '');
    }
  }, [cardToEdit, show, subjects]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) {
      toast.error('La question et la réponse sont obligatoires');
      return;
    }

    const cardData = { question: question.trim(), answer: answer.trim(), subject };

    if (cardToEdit) {
      onUpdate(cardData);
    } else {
      addCard(cardData);
    }
  };

  return (
    <ModalWrapper isOpen={show} onClose={onClose} title={cardToEdit ? "Modifier la carte" : "Ajouter une carte"}>
      <div className="space-y-4">
        <div>
          <label htmlFor="question" className="label">Question</label>
          <input
            id="question"
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Question"
            className="input"
          />
        </div>
        <div>
          <label htmlFor="answer" className="label">Réponse</label>
          <textarea
            id="answer"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Réponse"
            className="input h-24"
          />
        </div>
        <div>
          <label htmlFor="subject" className="label">Matière</label>
          <select
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="select"
          >
            {(subjects || []).map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-4 pt-6">
          <button
            onClick={handleSubmit}
            className="btn-primary"
          >
            {cardToEdit ? "Mettre à jour" : "Ajouter"}
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

export default AddCardModal;
