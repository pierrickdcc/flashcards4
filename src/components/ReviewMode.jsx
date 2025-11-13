
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDataSync } from '../context/DataSyncContext';
import { useUIState } from '../context/UIStateContext';
import { X } from 'lucide-react';

const ReviewMode = () => {
  const { getCardsToReview, reviewCard } = useDataSync();
  const { setReviewMode, selectedSubjects, isFreeReview } = useUIState();
  const [cardsToReview, setCardsToReview] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    const loadCards = async () => {
      const toReview = await getCardsToReview(selectedSubjects, { includeFuture: isFreeReview });
      setCardsToReview(toReview);
      setIsLoading(false);
    };
    loadCards();
  }, [getCardsToReview, selectedSubjects, isFreeReview]);

  const currentCard = cardsToReview[currentIndex];

  const handleAnswer = async (quality) => {
    if (!currentCard) return;
    await reviewCard(currentCard, quality);

    setShowAnswer(false);

    // Petite pause pour voir la carte se retourner avant de passer à la suivante
    setTimeout(() => {
      if (currentIndex < cardsToReview.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setReviewMode(false);
      }
    }, 300); // 300ms, le temps de l'animation de retournement
  };

  const handleExit = () => {
    setReviewMode(false);
  };

  useEffect(() => {
    if (!isLoading && cardsToReview.length === 0) {
      setReviewMode(false);
    }
  }, [isLoading, cardsToReview, setReviewMode]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex items-center justify-center">
        <p className="dark:text-white">Chargement des cartes...</p>
      </div>
    );
  }

  const progressPercentage = cardsToReview.length > 0 ? ((currentIndex + 1) / cardsToReview.length) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex flex-col p-4">
      {/* Header */}
      <div className="review-header">
        <h1 className="app-title">Flashcards</h1>
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${progressPercentage}%` }}></div>
        </div>
        <button onClick={handleExit} className="exit-button">
          <X size={24} />
        </button>
      </div>

      {/* Card and Actions */}
      <div className="flex-1 flex flex-col items-center justify-center w-full">
        <AnimatePresence>
          {currentCard && (
            <motion.div
              key={currentCard.id}
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-2xl flex flex-col items-center"
            >
              {/* Card Scene */}
              <div className="card-scene">
                <motion.div
                  className="flashcard"
                  onClick={() => setShowAnswer(!showAnswer)}
                  animate={{ rotateY: showAnswer ? 180 : 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {/* Front */}
                  <div className="card-face card-face-front">
                    <p className="text-2xl md:text-3xl font-light text-center dark:text-white">
                      {currentCard.question}
                    </p>
                    <span className="card-subject">{currentCard.subject}</span>
                  </div>
                  {/* Back */}
                  <div className="card-face card-face-back">
                    <p className="text-xl md:text-2xl font-light text-center dark:text-white">
                      {currentCard.answer}
                    </p>
                    <span className="card-subject">{currentCard.subject}</span>
                  </div>
                </motion.div>
              </div>

              {/* Difficulty Buttons */}
              <AnimatePresence>
                {showAnswer && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="flex items-center justify-center gap-2 md:gap-3 flex-wrap mt-8"
                  >
                    <button onClick={() => handleAnswer(1)} className="difficulty-capsule capsule-red">À revoir</button>
                    <button onClick={() => handleAnswer(2)} className="difficulty-capsule capsule-orange">Difficile</button>
                    <button onClick={() => handleAnswer(3)} className="difficulty-capsule capsule-yellow">Moyen</button>
                    <button onClick={() => handleAnswer(4)} className="difficulty-capsule capsule-blue">Facile</button>
                    <button onClick={() => handleAnswer(5)} className="difficulty-capsule capsule-green">Très facile</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

       {/* Footer Info */}
       <div className="text-center p-4 text-sm text-gray-500 dark:text-gray-400">
          {currentIndex + 1} / {cardsToReview.length}
          {isFreeReview && <span className="ml-2 font-semibold">- Révision Libre -</span>}
        </div>
    </div>
  );
};

export default ReviewMode;
