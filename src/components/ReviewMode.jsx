
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDataSync } from '../context/DataSyncContext';
import { useUIState } from '../context/UIStateContext';
import { X } from 'lucide-react';

const ReviewMode = () => {
  const { reviewCard } = useDataSync();
  const { setReviewMode, reviewCards } = useUIState();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const currentCard = reviewCards[currentIndex];

  const handleAnswer = async (rating) => {
    if (!currentCard) return;

    // The rating is from 1 to 5 as per our SRS logic
    await reviewCard(currentCard.id, rating);

    setShowAnswer(false);

    setTimeout(() => {
      if (currentIndex < reviewCards.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        // End of review session
        setReviewMode(false);
      }
    }, 300); // Wait for the card to flip back
  };

  const handleExit = () => {
    setReviewMode(false);
  };

  if (!currentCard) {
    // This can happen if the component is rendered while cards are being fetched
    // or if the review session ends. A loading or finished state could be shown.
    return (
       <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex items-center justify-center">
        <p className="dark:text-white">Fin de la session de révision !</p>
      </div>
    );
  }

  const progressPercentage = reviewCards.length > 0 ? ((currentIndex + 1) / reviewCards.length) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex flex-col p-4 sm:p-6 md:p-8">

      {/* Header */}
      <div className="flex items-center justify-between w-full max-w-5xl mx-auto mb-4">
        <h1 className="text-2xl font-bold dark:text-white">Flashcards</h1>
        <button onClick={handleExit} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
          <X size={24} className="dark:text-white" />
        </button>
      </div>

      {/* Progress Bar & Counter */}
      <div className="w-full max-w-5xl mx-auto mb-6">
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
          <motion.div
            className="bg-blue-600 h-2.5 rounded-full"
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">
          {currentIndex + 1} / {reviewCards.length}
        </p>
      </div>

      {/* Card and Actions */}
      <div className="flex-1 flex flex-col items-center justify-center w-full perspective">
        <AnimatePresence>
          <motion.div
            key={currentCard.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-2xl h-[55vh]" // Increased card height
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
                  <div/>
                </div>
                {/* Back */}
                <div className="card-face-new card-face-back-new">
                  <span className="card-subject-new">{currentCard.subject}</span>
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

      {/* Difficulty Buttons Footer */}
      <div className="w-full max-w-4xl mx-auto pt-6 pb-2">
        <AnimatePresence>
          {showAnswer && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="flex items-center justify-center gap-2 md:gap-4 flex-wrap"
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
