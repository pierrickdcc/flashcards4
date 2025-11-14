
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
    <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex flex-col p-4 sm:p-6 md:p-8">

      {/* Header */}
      <div className="flex items-center justify-between w-full max-w-5xl mx-auto mb-4">
        <h1 className="text-2xl font-bold dark:text-white">Flashcards</h1>
        {isFreeReview && <span className="font-semibold text-blue-500 dark:text-blue-400">- Révision Libre -</span>}
        <button onClick={handleExit} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
          <X size={24} className="dark:text-white" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-5xl mx-auto mb-6">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
          <span>Progression</span>
          <span>{currentIndex + 1} / {cardsToReview.length}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
          <motion.div
            className="bg-blue-600 h-2.5 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>


      {/* Card and Actions */}
      <div className="flex-1 flex flex-col items-center justify-center w-full perspective">
        <AnimatePresence>
          {currentCard && (
            <motion.div
              key={currentCard.id}
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.95, transition: { duration: 0.2 } }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="w-full max-w-2xl h-[60vh] flex flex-col items-center justify-center"
            >
              {/* Card Scene */}
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
                     <span className="card-subject-new">{currentCard.subject}</span>
                    <p className="text-3xl md:text-4xl font-light text-center text-gray-800">
                      {currentCard.question}
                    </p>
                    <div></div>
                  </div>
                  {/* Back */}
                  <div className="card-face-new card-face-back-new">
                    <span className="card-subject-new">{currentCard.subject}</span>
                    <p className="text-2xl md:text-3xl font-light text-center text-gray-800">
                      {currentCard.answer}
                    </p>
                    <div></div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Difficulty Buttons Footer */}
      <div className="w-full max-w-2xl mx-auto pt-6 pb-2">
        <AnimatePresence>
          {showAnswer && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }}
              exit={{ opacity: 0, y: 20 }}
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
      </div>
    </div>
  );
};

export default ReviewMode;
