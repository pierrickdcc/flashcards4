
import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useDataSync } from '../context/DataSyncContext';
import { useUIState } from '../context/UIStateContext';

const ReviewMode = () => {
  const { getCardsToReview, reviewCard } = useDataSync();
  const { setReviewMode, selectedSubjects, isFreeReview } = useUIState();
  const [cardsToReview, setCardsToReview] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [direction, setDirection] = useState(0);
  const controls = useAnimation();

  useEffect(() => {
    const loadCards = async () => {
      const toReview = await getCardsToReview(selectedSubjects, { includeFuture: isFreeReview });
      setCardsToReview(toReview);
      setIsLoading(false);
    };
    loadCards();
  }, [getCardsToReview, selectedSubjects, isFreeReview]);

  const currentCard = cardsToReview[currentIndex];

  useEffect(() => {
    if (!isLoading && currentCard) {
      const timer = setTimeout(() => {
        document.getElementById('review-card')?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, isLoading, currentCard]);

  const handleAnswer = async (quality) => {
    await reviewCard(currentCard, quality);
    
    if (currentIndex < cardsToReview.length - 1) {
      setDirection(quality >= 3 ? 1 : -1);
      await controls.start({
        x: quality >= 3 ? 1000 : -1000,
        opacity: 0,
        transition: { duration: 0.3 }
      });
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
      setDirection(0);
      controls.start({ x: 0, opacity: 1 });
    } else {
      setReviewMode(false);
    }
  };

  const handleSwipe = async (event, info) => {
    if (Math.abs(info.offset.x) > 100) {
      if (info.offset.x > 0) {
        handleAnswer(4); // Swipe droit = Facile
      } else {
        handleAnswer(2); // Swipe gauche = Difficile
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      setShowAnswer(true);
    }
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

  if (!currentCard) {
    return null; // Le useEffect ci-dessus s'occupera de fermer le mode révision
  }

  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setReviewMode(false)}
          className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="text-sm font-medium dark:text-white">
          {currentIndex + 1} / {cardsToReview.length}
          {isFreeReview && <span className="ml-2 text-gray-400">- Révision Libre</span>}
        </div>
        <div className="w-10" />
      </div>

      {/* Card Scene */}
      <div className="flex-1 flex items-center justify-center p-4 card-scene">
        <motion.div
          className="flashcard"
          onClick={() => setShowAnswer(!showAnswer)}
          animate={{ rotateY: showAnswer ? 180 : 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Front of the card (Question) */}
          <div className="card-face card-face-front">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-4">
              {currentCard.subject}
            </div>
            <div className="flex-1 flex items-center justify-center w-full">
              <p className="text-3xl font-light text-center dark:text-white">
                {currentCard.question}
              </p>
            </div>
            <div className="absolute bottom-6 text-xs text-gray-400">
              Cliquez pour révéler
            </div>
          </div>

          {/* Back of the card (Answer + Difficulty) */}
          <div className="card-face card-face-back">
            <div className="flex-1 flex flex-col items-center justify-center w-full p-6">
              <p className="text-2xl font-light text-center dark:text-white mb-8">
                {currentCard.answer}
              </p>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <button onClick={() => handleAnswer(1)} className="difficulty-capsule capsule-red">À revoir</button>
                <button onClick={() => handleAnswer(2)} className="difficulty-capsule capsule-orange">Difficile</button>
                <button onClick={() => handleAnswer(3)} className="difficulty-capsule capsule-yellow">Moyen</button>
                <button onClick={() => handleAnswer(4)} className="difficulty-capsule capsule-blue">Facile</button>
                <button onClick={() => handleAnswer(5)} className="difficulty-capsule capsule-green">Très facile</button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ReviewMode;
