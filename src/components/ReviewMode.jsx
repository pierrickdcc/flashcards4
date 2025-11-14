import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDataSync } from '../context/DataSyncContext';
import { useUIState } from '../context/UIStateContext';
import { X, CheckCircle, RotateCcw, Home, BookOpen } from 'lucide-react';
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
      <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-4 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="flex flex-col items-center gap-4"
        >
          <CheckCircle size={72} className="text-green-500" />
          <div className='flex flex-col gap-2'>
            <h2 className="text-4xl font-bold text-foreground">Session terminée !</h2>
            <p className="text-muted-foreground text-lg">Bravo, vous avez terminé votre session de révision.</p>
          </div>
          <div className="flex items-center justify-center gap-4 mt-6">
            <button onClick={handleRestart} className="btn-secondary text-base py-3 px-6">
              <RotateCcw size={18} className="mr-2" />
              <span>Recommencer</span>
            </button>
            <button onClick={handleExit} className="btn-primary text-base py-3 px-6">
              <Home size={18} className="mr-2" />
              <span>Retour à l'accueil</span>
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!currentCard) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
        <p className="text-foreground">Chargement des cartes...</p>
      </div>
    );
  }

  const currentSubjectName = subjectMap.get(currentCard.subject_id) || 'N/A';
  const totalCards = reviewCards.length;
  const progressPercentage = totalCards > 0 ? ((currentIndex + 1) / totalCards) * 100 : 0;

  // Progress Bar Logic
  const ProgressBar = () => {
    const isSegmented = totalCards > 0 && totalCards < 20;

    if (isSegmented) {
      return (
        <div className="flex gap-1.5 w-full">
          {Array.from({ length: totalCards }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-2 rounded-full transition-colors duration-300 ${
                i < currentIndex + 1 ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>
      );
    }

    return (
      <div className="w-full bg-muted rounded-full h-2.5">
        <motion.div
          className="bg-primary h-2.5 rounded-full"
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex h-screen flex-col items-center p-4 sm:p-6 md:p-8 gap-4 md:gap-6">
      {/* Header */}
      <header className="w-full max-w-7xl flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-decoration-none">
          <BookOpen className="text-primary" size={28} />
          <span className="logo-text">Flashcards Pro</span>
        </Link>
        <AnimatePresence>
          {!isFinished && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2"
            >
              <button onClick={handleRestart} className="btn-icon">
                <RotateCcw size={20} />
              </button>
              <button onClick={handleExit} className="btn-icon">
                <X size={24} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-start w-full max-w-4xl gap-4 md:gap-6 pt-2 sm:pt-4 md:pt-8">
        <div className="w-full">
          <ProgressBar />
          <p className="text-center text-sm text-muted-foreground mt-2">
            Carte {currentIndex + 1} sur {totalCards}
          </p>
        </div>

        <div className="flex-1 w-full flex items-center justify-center perspective">
          <AnimatePresence>
            <motion.div
              key={currentCard.id}
              initial={{ opacity: 0, scale: 0.95, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -50 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-2xl h-[50vh] sm:h-[55vh]"
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
                  <div className="card-face-new card-face-front-new">
                     <span className="card-subject-new">{currentSubjectName}</span>
                    <p className="text-3xl md:text-4xl font-light text-center text-gray-800">
                      {currentCard.question}
                    </p>
                    <div/>
                  </div>
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
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-4xl h-24 flex items-center justify-center">
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
