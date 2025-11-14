import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDataSync } from '../context/DataSyncContext';
import { useUIState } from '../context/UIStateContext';
import { X, RotateCcw, BookOpen, CheckCircle, Home } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const ReviewMode = () => {
  const { reviewCard, subjects } = useDataSync();
  const { setReviewMode, reviewCards } = useUIState();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const navigate = useNavigate();

  const subjectMap = useMemo(() => new Map(subjects.map(s => [s.id, s.name])), [subjects]);
  const currentCard = reviewCards[currentIndex];

  const handleRating = async (rating) => {
    if (!currentCard) return;
    await reviewCard(currentCard.id, rating);

    // Go to next card or finish
    if (currentIndex < reviewCards.length - 1) {
      setIsFlipped(false);
      // Wait for flip animation before changing content
      setTimeout(() => setCurrentIndex(currentIndex + 1), 300);
    } else {
      setIsFinished(true);
    }
  };

  const handleRestart = () => {
    // Logic to restart the session, maybe re-fetch or re-shuffle cards
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsFinished(false);
  };

  const handleExit = () => {
    setReviewMode(false);
    navigate('/');
  };

  if (isFinished) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-4">
          <CheckCircle size={64} className="text-green-500" />
          <h2 className="text-3xl font-bold text-heading">Session terminée !</h2>
          <p>Bravo, vous avez terminé votre session de révision.</p>
          <div className="flex gap-4 mt-4">
            <button onClick={handleRestart} className="btn btn-secondary"><RotateCcw size={16} /> Recommencer</button>
            <button onClick={handleExit} className="btn btn-primary"><Home size={16} /> Accueil</button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!currentCard) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Chargement des cartes...</p>
      </div>
    );
  }

  const progressPercentage = ((currentIndex + 1) / reviewCards.length) * 100;

  const ratingButtons = [
    { label: 'À revoir', rating: 1, className: 'btn-rating-1' },
    { label: 'Difficile', rating: 2, className: 'btn-rating-2' },
    { label: 'Moyen', rating: 3, className: 'btn-rating-3' },
    { label: 'Facile', rating: 4, className: 'btn-rating-4' },
    { label: 'Très facile', rating: 5, className: 'btn-rating-5' },
  ];

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <header className="review-header">
        <Link to="/" className="logo">
          <BookOpen />
          <span className="logo-text">Flashcards Pro</span>
        </Link>
        <div className="progress-container">
          <div className="progress-bar">
            <motion.div
              className="progress-bar-inner"
              initial={{ width: `${(currentIndex / reviewCards.length) * 100}%` }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
          <p className="progress-text">Carte {currentIndex + 1} sur {reviewCards.length}</p>
        </div>
        <div className="header-actions">
          <button onClick={handleRestart} className="icon-btn" title="Recommencer">
            <RotateCcw size={20} />
          </button>
          <button onClick={handleExit} className="icon-btn" title="Quitter le mode révision">
            <X size={24} />
          </button>
        </div>
      </header>

      {/* Main Card Area */}
      <main className="review-main">
        <div className="card-scene">
          <motion.div
            className="card-flipper"
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
          >
            {/* Front */}
            <div className="card-face card-face-front" onClick={() => !isFlipped && setIsFlipped(true)}>
              <span className="card-subject-tag">{subjectMap.get(currentCard.subject_id) || 'Sujet'}</span>
              <p className="card-content">{currentCard.question}</p>
              <div style={{ height: '24px' }}></div>
            </div>
            {/* Back */}
            <div className="card-face card-face-back">
              <span className="card-subject-tag">{subjectMap.get(currentCard.subject_id) || 'Sujet'}</span>
              <p className="card-content text-xl">{currentCard.answer}</p>
              <div style={{ height: '24px' }}></div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="review-footer">
        <AnimatePresence mode="wait">
          {!isFlipped ? (
            <motion.div key="show" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <button className="btn btn-primary px-10 py-3 text-base" onClick={() => setIsFlipped(true)}>
                Retourner la carte
              </button>
            </motion.div>
          ) : (
            <motion.div key="rate" initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.2 } }} exit={{ opacity: 0 }}
              className="difficulty-buttons"
            >
              {ratingButtons.map(btn => (
                <button key={btn.rating} className={`btn ${btn.className}`} onClick={() => handleRating(btn.rating)}>
                  {btn.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </footer>
    </div>
  );
};

export default ReviewMode;
