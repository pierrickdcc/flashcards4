import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDataSync } from '../context/DataSyncContext';
import { useUIState } from '../context/UIStateContext';
import { X, RotateCcw, BookOpen, CheckCircle, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

const ReviewMode = () => {
  const { reviewCard, subjects } = useDataSync();
  const { setReviewMode, reviewCards, setReviewCards } = useUIState();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [direction, setDirection] = useState(1);

  const subjectMap = useMemo(() => new Map(subjects.map(s => [s.id, s.name])), [subjects]);
  const currentCard = reviewCards[currentIndex];

  const handleRating = async (rating) => {
    if (!currentCard) return;
    setDirection(1); // Set direction for next card animation
    await reviewCard(currentCard.id, rating);
    setIsFlipped(false);

    setTimeout(() => {
      if (currentIndex < reviewCards.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setIsFinished(true);
      }
    }, 200); // Wait for flip-back animation
  };

  const handleRestart = () => {
    setReviewCards([...reviewCards].sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsFinished(false);
  };

  const handleExit = () => setReviewMode(false);

  // Finished Screen
  if (isFinished) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-4 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-4">
          <CheckCircle size={64} className="text-green-500" />
          <h2 className="text-3xl font-bold">Session terminée !</h2>
          <p className="text-muted-foreground">Bravo, vous avez terminé votre session de révision.</p>
          <div className="flex gap-4 mt-4">
            <button onClick={handleRestart} className="btn-secondary px-5 py-2.5 rounded-lg"><RotateCcw size={16} /> Recommencer</button>
            <button onClick={handleExit} className="btn-primary px-5 py-2.5 rounded-lg"><Home size={16} /> Accueil</button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!currentCard) return <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">Chargement...</div>;

  const progress = (currentIndex / reviewCards.length) * 100;

  const cardVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
      scale: 0.9,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 100 : -100,
      opacity: 0,
      scale: 0.9,
    }),
  };

  const ratingButtons = [
    { label: 'À revoir', rating: 1, color: 'bg-red-500' },
    { label: 'Difficile', rating: 2, color: 'bg-orange-500' },
    { label: 'Moyen', rating: 3, color: 'bg-yellow-500' },
    { label: 'Facile', rating: 4, color: 'bg-blue-500' },
    { label: 'Très facile', rating: 5, color: 'bg-green-500' },
  ];

  return (
    <div className="fixed inset-0 bg-background z-50 flex h-screen flex-col items-center p-4 sm:p-6">
      {/* Header */}
      <header className="w-full max-w-4xl flex items-center gap-6 py-2">
        <Link to="/" className="flex items-center gap-2 text-decoration-none">
          <BookOpen className="text-primary" size={24} />
          <span className="logo-text text-lg font-bold">Flashcards Pro</span>
        </Link>
        <div className="flex-grow flex items-center gap-4">
          <div className="w-full bg-muted rounded-full h-2">
            <motion.div className="bg-primary h-2 rounded-full" animate={{ width: `${progress}%` }} />
          </div>
          <span className="text-sm font-semibold text-muted-foreground whitespace-nowrap">{currentIndex} / {reviewCards.length}</span>
        </div>
        <div className="flex items-center gap-2">
            <button onClick={handleRestart} title="Recommencer" className="p-2 rounded-full hover:bg-white/10"><RotateCcw size={18} /></button>
            <button onClick={handleExit} title="Quitter" className="p-2 rounded-full hover:bg-white/10"><X size={22} /></button>
        </div>
      </header>

      {/* Main Card Area */}
      <main className="flex-1 flex flex-col items-center justify-center w-full overflow-hidden">
        <div className="w-full max-w-4xl aspect-[16/9] max-h-[500px] perspective">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={cardVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
              className="w-full h-full"
            >
              <motion.div
                className="w-full h-full preserve-3d"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
              >
                {/* Front */}
                <div className="card-face-new card-face-front-new" onClick={() => setIsFlipped(true)}>
                  <span className="card-subject-new">{subjectMap.get(currentCard.subject_id)}</span>
                  <p className="text-2xl md:text-3xl font-medium text-center">{currentCard.question}</p>
                  <div />
                </div>
                {/* Back */}
                <div className="card-face-new card-face-back-new">
                  <span className="card-subject-new">{subjectMap.get(currentCard.subject_id)}</span>
                  <p className="text-xl md:text-2xl font-medium text-center">{currentCard.answer}</p>
                  <div />
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full h-28 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {!isFlipped ? (
            <motion.button key="flip" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}
              onClick={() => setIsFlipped(true)}
              className="btn-primary px-8 py-3 rounded-lg text-base font-semibold"
            >
              Retourner la carte
            </motion.button>
          ) : (
            <motion.div key="ratings" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}
              className="flex flex-wrap justify-center gap-3"
            >
              {ratingButtons.map(btn => (
                <button key={btn.rating} onClick={() => handleRating(btn.rating)}
                  className={`px-5 py-2.5 rounded-lg text-white text-sm font-semibold transition-transform hover:scale-105 ${btn.color}`}
                >
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