// src/utils/spacedRepetition.js

const DEFAULT_EASE_FACTOR = 2.5;
const MIN_EASE_FACTOR = 1.3;

// Learning steps in minutes. A card graduates after completing all steps.
const LEARNING_STEPS = [1, 10]; // e.g., 1 minute, then 10 minutes

// Helper to get the due date string
const getDueDate = (days) => {
  const date = new Date();
  date.setHours(5, 0, 0, 0); // Set to a consistent time to avoid timezone issues
  date.setDate(date.getDate() + days);
  return date.toISOString();
};

const getDueTime = (minutes) => {
  const date = new Date();
  date.setMinutes(date.getMinutes() + minutes);
  return date.toISOString();
};

/**
 * Calculates the next review data for a flashcard based on a detailed SM-2 algorithm.
 * @param {object} progress - The current progress object of the card.
 *   Expected properties: { interval, easeFactor, status, step }
 * @param {number} rating - User's rating (1: Again, 2: Hard, 3: Good, 4: Easy). Note: The user provided 5 ratings, but SM-2 traditionally uses 4-5 ratings where the lowest is failure. We map 5 ratings to these concepts.
 * Rating mapping: 1(Again), 2(Hard), 3(Good), 4(Easy), 5(Very Easy)
 */
export const calculateSrsData = (progress, rating) => {
  let {
    interval = 0,
    easeFactor = DEFAULT_EASE_FACTOR,
    status = 'new',
    step = 0, // Current position in the LEARNING_STEPS array
  } = progress || {};

  // --- 1. Handle NEW Cards ---
  if (status === 'new') {
    switch (rating) {
      case 1: // Again
        // Enters learning phase at the first step
        return {
          status: 'learning',
          step: 0,
          easeFactor: Math.max(MIN_EASE_FACTOR, easeFactor - 0.20),
          dueDate: getDueTime(LEARNING_STEPS[0]),
          interval: 0,
        };
      case 2: // Hard
      case 3: // Good
        // Enters learning phase at the second step
        return {
          status: 'learning',
          step: 1, // Start at the 10-minute step
          easeFactor: easeFactor,
          dueDate: getDueTime(LEARNING_STEPS[1]),
          interval: 0,
        };
      case 4: // Easy
        // Graduates immediately
        return {
          status: 'review',
          step: 0,
          easeFactor: easeFactor,
          interval: 1, // First review in 1 day
          dueDate: getDueDate(1),
        };
      case 5: // Very Easy
        // Graduates immediately with a longer interval
        return {
          status: 'review',
          step: 0,
          easeFactor: easeFactor + 0.15,
          interval: 4, // First review in 4 days
          dueDate: getDueDate(4),
        };
      default:
        return { status: 'learning', step: 0, dueDate: getDueTime(LEARNING_STEPS[0]), interval: 0, easeFactor };
    }
  }

  // --- 2. Handle LEARNING Cards ---
  if (status === 'learning') {
    switch (rating) {
      case 1: // Again (Fail) -> Reset learning from the first step
        return {
          status: 'learning',
          step: 0,
          easeFactor: Math.max(MIN_EASE_FACTOR, easeFactor - 0.20),
          dueDate: getDueTime(LEARNING_STEPS[0]),
          interval: 0,
        };
      case 2: // Hard -> Repeat the current step
         return {
          status: 'learning',
          step: step,
          easeFactor: Math.max(MIN_EASE_FACTOR, easeFactor - 0.15),
          dueDate: getDueTime(LEARNING_STEPS[step]),
          interval: 0,
        };
      case 3: // Good -> Advance to the next step or graduate
        const nextStep = step + 1;
        if (nextStep >= LEARNING_STEPS.length) {
          // Graduate to review
          return {
            status: 'review',
            step: 0,
            easeFactor: easeFactor,
            interval: 1, // First real interval is 1 day
            dueDate: getDueDate(1),
          };
        } else {
          // Go to the next learning step
          return {
            status: 'learning',
            step: nextStep,
            easeFactor: easeFactor,
            dueDate: getDueTime(LEARNING_STEPS[nextStep]),
            interval: 0,
          };
        }
       case 4: // Easy & Very Easy -> Graduate immediately
       case 5:
        return {
          status: 'review',
          step: 0,
          easeFactor: easeFactor + (rating === 5 ? 0.15 : 0),
          interval: 1,
          dueDate: getDueDate(1),
        };
      default:
         return { status: 'learning', step: 0, dueDate: getDueTime(LEARNING_STEPS[0]), interval: 0, easeFactor };
    }
  }

  // --- 3. Handle REVIEW Cards ---
  if (status === 'review') {
    // RATING 1: LAPSE (Fail)
    if (rating === 1) {
      return {
        status: 'learning', // Demote card back to learning
        step: 0,
        easeFactor: Math.max(MIN_EASE_FACTOR, easeFactor - 0.20),
        interval: 0, // Reset interval
        dueDate: getDueTime(LEARNING_STEPS[0]), // Re-learn in 10 minutes
      };
    }

    // SUCCESSFUL REVIEW (Ratings 2, 3, 4, 5)
    let newEaseFactor = easeFactor;
    let newInterval;

    switch (rating) {
        case 2: // Hard
            newEaseFactor = Math.max(MIN_EASE_FACTOR, easeFactor - 0.15);
            newInterval = Math.round(interval * 1.2);
            break;
        case 3: // Good
            // Ease factor is unchanged
            newInterval = Math.round(interval * easeFactor);
            break;
        case 4: // Easy
            newEaseFactor = easeFactor + 0.15;
            // The bonus is applied to the interval calculation itself
            newInterval = Math.round(interval * newEaseFactor * 1.3);
            break;
        case 5: // Very Easy
            newEaseFactor = easeFactor + 0.30; // Stronger increase for very easy
            newInterval = Math.round(interval * newEaseFactor * 1.8);
            break;
        default:
            newInterval = Math.round(interval * easeFactor); // Fallback to 'Good'
            break;
    }

    // Ensure interval increases by at least 1 day
    if (newInterval <= interval) {
      newInterval = interval + 1;
    }

    return {
      interval: newInterval,
      easeFactor: newEaseFactor,
      status: 'review',
      step: 0,
      dueDate: getDueDate(newInterval),
    };
  }

  // Fallback for safety, should not be reached
  return { status: 'learning', step: 0, dueDate: getDueTime(LEARNING_STEPS[0]), interval: 0, easeFactor: DEFAULT_EASE_FACTOR };
};
