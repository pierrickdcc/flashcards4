
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

  const handleAnswer = async (e, quality) => {
    e.stopPropagation(); // Empêche le clic de se propager à la carte
    await reviewCard(currentCard, quality);

    // Animation de sortie
    await controls.start({
      opacity: 0,
      y: -50,
      transition: { duration: 0.3 }
    });

    if (currentIndex < cardsToReview.length - 1) {
      // Préparer pour la prochaine carte
      setShowAnswer(false);
      setCurrentIndex(prevIndex => prevIndex + 1);

      // Animation d'entrée
      controls.set({ y: 50, opacity: 0 });
      controls.start({
        opacity: 1,
        y: 0,
        transition: { duration: 0.3, delay: 0.1 }
      });
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
      {/* Simplified Header */}
      <div className="px-4 py-3 text-center">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {currentIndex + 1} / {cardsToReview.length}
          {isFreeReview && <span className="ml-2 text-gray-400">- Révision Libre</span>}
        </span>
      </div>

      {/* Card Scene and Difficulty Buttons */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 space-y-8">
        <div className="card-scene">
          <motion.div
            className="flashcard"
            onClick={() => setShowAnswer(!showAnswer)}
            animate={{ ...controls, rotateY: showAnswer ? 180 : 0 }}
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

            {/* Back of the card (Answer) */}
            <div className="card-face card-face-back">
              <div className="flex-1 flex flex-col items-center justify-center w-full p-6">
                <p className="text-2xl font-light text-center dark:text-white">
                  {currentCard.answer}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Difficulty Buttons */}
        <div className={`flex items-center justify-center gap-3 flex-wrap transition-opacity duration-300 ${showAnswer ? 'opacity-100' : 'opacity-0'}`}>
          <button onClick={(e) => handleAnswer(e, 1)} className="difficulty-capsule capsule-red">À revoir</button>
          <button onClick={(e) => handleAnswer(e, 2)} className="difficulty-capsule capsule-orange">Difficile</button>
          <button onClick={(e) => handleAnswer(e, 3)} className="difficulty-capsule capsule-yellow">Moyen</button>
          <button onClick={(e) => handleAnswer(e, 4)} className="difficulty-capsule capsule-blue">Facile</button>
          <button onClick={(e) => handleAnswer(e, 5)} className="difficulty-capsule capsule-green">Très facile</button>
        </div>
      </div>
    </div>
  );
};

export default ReviewMode;
