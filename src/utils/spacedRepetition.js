// src/utils/spacedRepetition.js

const DEFAULT_EASE_FACTOR = 2.5;
const MIN_EASE_FACTOR = 1.3;

// Helper to get the due date string
const getDueDate = (days) => {
  const date = new Date();
  // Set time to a consistent point to avoid timezone issues affecting the date
  date.setHours(5, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return date.toISOString();
};

/**
 * Calculates the next review data for a flashcard based on the SM-2 algorithm principles.
 * @param {object} progress - The current progress object of the card.
 *   Expected properties: { interval: number, easeFactor: number, status: 'new'|'learning'|'review' }
 * @param {number} rating - The user's rating of recall difficulty (1: Again, 2: Hard, 3: Good, 4: Easy, 5: Very Easy).
 * @returns {{interval: number, easeFactor: number, status: string, dueDate: string}} - The updated progress data.
 */
export const calculateSrsData = (progress, rating) => {
  let {
    interval = 0,
    easeFactor = DEFAULT_EASE_FACTOR,
    status = 'new',
  } = progress || {};

  // --- Handle New or Learning Cards ---
  if (status === 'new' || status === 'learning') {
    switch (rating) {
      case 1: // "Again": User failed, restart learning for this card.
        return {
          interval: 1,
          easeFactor: Math.max(MIN_EASE_FACTOR, easeFactor - 0.2),
          status: 'learning',
          dueDate: getDueDate(1),
        };
      case 2: // "Hard": Show again tomorrow.
        return {
          interval: 1,
          easeFactor: easeFactor, // No EF change in learning phase
          status: 'learning',
          dueDate: getDueDate(1),
        };
      case 3: // "Good": Graduate to the review phase. First interval is 1 day.
        return {
          interval: 1,
          easeFactor: easeFactor,
          status: 'review',
          dueDate: getDueDate(1),
        };
      case 4: // "Easy": Graduate and set a longer first interval.
        return {
          interval: 4,
          easeFactor: easeFactor + 0.15,
          status: 'review',
          dueDate: getDueDate(4),
        };
      case 5: // "Very Easy": Should be rare for a new card, but graduate with a very long interval.
        return {
          interval: 7,
          easeFactor: easeFactor + 0.3,
          status: 'review',
          dueDate: getDueDate(7),
        };
      default:
        // Fallback for safety
        return {
          interval: 1,
          easeFactor,
          status: 'learning',
          dueDate: getDueDate(1),
        };
    }
  }

  // --- Handle Mature/Review Cards ---
  if (status === 'review') {
    // RATING 1: LAPSE - The user forgot the card.
    if (rating === 1) {
      return {
        interval: 1, // Reset interval
        easeFactor: Math.max(MIN_EASE_FACTOR, easeFactor - 0.2), // Penalize ease factor
        status: 'learning', // Demote card back to learning phase
        dueDate: getDueDate(1),
      };
    }

    // SUCCESSFUL REVIEW (Ratings 2, 3, 4, 5)
    let newInterval;
    let newEaseFactor = easeFactor;

    // Special case for the first review after graduating
    if (interval <= 1) {
      newInterval = 6;
    } else {
      // Calculate interval based on rating
      switch (rating) {
        case 2: // "Hard": Success, but difficult. Small interval increase.
          newEaseFactor = Math.max(MIN_EASE_FACTOR, easeFactor - 0.15);
          newInterval = Math.round(interval * 1.2);
          break;
        case 3: // "Good": Standard success.
          // Ease factor remains unchanged
          newInterval = Math.round(interval * easeFactor);
          break;
        case 4: // "Easy": High success. Increase EF and add bonus to interval.
          newEaseFactor += 0.15;
          newInterval = Math.round(interval * newEaseFactor * 1.3);
          break;
        case 5: // "Very Easy": Trivial. Increase EF and add a large bonus.
          newEaseFactor += 0.25;
          newInterval = Math.round(interval * newEaseFactor * 1.8);
          break;
        default:
          newInterval = interval; // Should not happen
          break;
      }
    }

    // Safety check to ensure the interval always increases on success.
    if (newInterval <= interval) {
      newInterval = interval + 1;
    }

    return {
      interval: newInterval,
      easeFactor: newEaseFactor,
      status: 'review',
      dueDate: getDueDate(newInterval),
    };
  }

  // Fallback for any unknown status, reset to a learning state.
  return {
    interval: 1,
    easeFactor: DEFAULT_EASE_FACTOR,
    status: 'learning',
    dueDate: getDueDate(1),
  };
};
