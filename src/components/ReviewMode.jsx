import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDataSync } from '../context/DataSyncContext';
import { useUIState } from '../context/UIStateContext';
import { X, CheckCircle, RotateCcw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

const ReviewMode = () => {
  const { reviewCard, subjects } = useDataSync();
  const { setReviewMode, reviewCards, setReviewCards } = useUIState();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const subjectMap = useMemo(() => new Map(subjects.map(s => [s.id, s.name])), [subjects]);
  const currentCard = reviewCards[currentIndex];

  const handleAnswer = async (rating) => {
    if (!currentCard) return;

    await reviewCard(currentCard.id, rating);
    setShowAnswer(false);

    setTimeout(() => {
      if (currentIndex < reviewCards.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setIsFinished(true);
      }
    }, 300);
  };

  const handleRestart = () => {
    // Re-shuffle cards for a fresh session
    const shuffledCards = [...reviewCards].sort(() => Math.random() - 0.5);
    setReviewCards(shuffledCards);
    setCurrentIndex(0);
    setShowAnswer(false);
    setIsFinished(false);
  };

  const handleExit = () => {
    setReviewMode(false);
  };

  if (isFinished) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
          <h2 className="text-3xl font-bold mb-2">Session terminée !</h2>
          <p className="text-muted mb-6">Bravo, vous avez terminé votre session de révision.</p>
          <div className="flex justify-center gap-4">
            <button onClick={handleRestart} className="btn-secondary">
              <RotateCcw size={18} />
              <span>Recommencer</span>
            </button>
            <button onClick={handleExit} className="btn-primary">
              <Home size={18} />
              <span>Retour à l'accueil</span>
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!currentCard) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex items-center justify-center">
        <p className="dark:text-white">Chargement des cartes...</p>
      </div>
    );
  }

  const currentSubjectName = subjectMap.get(currentCard.subject_id) || 'N/A';
  const totalCards = reviewCards.length;
  const progressPercentage = totalCards > 0 ? ((currentIndex + 1) / totalCards) * 100 : 0;

  // Segmented progress bar logic
  const isSegmented = totalCards > 1 && totalCards < 10;
  const ProgressBar = () => {
    if (isSegmented) {
      return (
        <div className="flex gap-1 w-full">
          {Array.from({ length: totalCards }).map((_, i) => (
            <div key={i} className="flex-1 h-2 rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className={`h-full rounded-full ${i < currentIndex + 1 ? 'bg-blue-600' : ''}`}
              />
            </div>
          ))}
        </div>
      );
    }
    return (
      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
        <motion.div
          className="bg-blue-600 h-2.5 rounded-full"
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex flex-col p-4 sm:p-6 md:p-8">
      {/* Header */}
      <header className="w-full max-w-7xl mx-auto flex items-center justify-between pb-4">
        <Link to="/" className="logo text-decoration-none">
          <img src="/logo.svg" alt="Logo" className="h-8 w-auto" />
          <span className="logo-text">Flashlet</span>
        </Link>
        <div className="flex items-center gap-2">
          <button onClick={handleRestart} className="btn-secondary">
            <RotateCcw size={16} />
            <span>Recommencer</span>
          </button>
          <button onClick={handleExit} className="btn-secondary">
            <X size={16} />
            <span>Quitter</span>
          </button>
        </div>
      </header>

      {/* Progress Bar & Counter */}
      <div className="w-full max-w-4xl mx-auto my-4">
        <ProgressBar />
        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">
          Carte {currentIndex + 1} sur {totalCards}
        </p>
      </div>

      {/* Main Content: Card */}
      <main className="flex-1 flex items-center justify-center w-full perspective">
        <AnimatePresence>
          <motion.div
            key={currentCard.id}
            initial={{ opacity: 0, scale: 0.95, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -50 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-2xl h-[55vh]"
          >
            <div
              className="relative w-full h-full cursor-pointer"
              onClick={() => setShowAnswer(!showAnswer)}
            >
              <motion.div
                className="absolute w-full h-full preserve-3d"
                animate={{ rotateY: showAnswer ? 180 : 0 }}
                transition={{ duration: 0.6 }}
              >
                {/* Front */}
                <div className="card-face-new card-face-front-new">
                   <span className="card-subject-new">{currentSubjectName}</span>
                  <p className="text-3xl md:text-4xl font-light text-center text-gray-800">
                    {currentCard.question}
                  </p>
                  <div/>
                </div>
                {/* Back */}
                <div className="card-face-new card-face-back-new">
                  <span className="card-subject-new">{currentSubjectName}</span>
                  <p className="text-2xl md:text-3xl font-light text-center text-gray-800">
                    {currentCard.answer}
                  </p>
                  <div/>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-4xl mx-auto pt-6 pb-2 h-24 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {!showAnswer ? (
            <motion.button
              key="flip"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              onClick={() => setShowAnswer(true)}
              className="btn-primary text-lg px-12 py-4"
            >
              Retourner la carte
            </motion.button>
          ) : (
            <motion.div
              key="difficulty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex items-center justify-center gap-2 md:gap-3 flex-wrap"
            >
              <button onClick={() => handleAnswer(1)} className="difficulty-capsule capsule-red">À revoir</button>
              <button onClick={() => handleAnswer(2)} className="difficulty-capsule capsule-orange">Difficile</button>
              <button onClick={() => handleAnswer(3)} className="difficulty-capsule capsule-yellow">Moyen</button>
              <button onClick={() => handleAnswer(4)} className="difficulty-capsule capsule-blue">Facile</button>
              <button onClick={() => handleAnswer(5)} className="difficulty-capsule capsule-green">Très facile</button>
            </motion.div>
          )}
        </AnimatePresence>
      </footer>
    </div>
  );
};

export default ReviewMode;
