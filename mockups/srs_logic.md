# SRS Algorithm as described by the user

The user wants to implement a Spaced Repetition System (SRS) based on the SM-2 algorithm.
The system should have 5 difficulty ratings: "Again", "Hard", "Good", "Easy", and "Very Easy".

## Card States
A card can be in one of three states:
- **New**: A card that has never been reviewed.
- **Learning**: A card that has been seen but is not yet committed to long-term memory.
- **Review**: A card that is considered "known" and is in the long-term review cycle.

## Button Logic

### New Card
- **Again**: The card enters the "Learning" phase. To be reviewed again in 1 minute.
- **Hard/Good**: The card enters the "Learning" phase. To be reviewed again in 10 minutes.
- **Easy/Very Easy**: The card "graduates" to the "Review" phase. The first interval is set to 1-4 days.

### Learning Card
- **Again**: The interval is reset. The card will be shown again in 1 minute.
- **Hard/Good**: The card moves to the next step in the learning loop (e.g., from 1 minute to 10 minutes).
- **Easy/Very Easy**: The card "graduates" to the "Review" phase.

### Review Card
This is the core of the SRS algorithm. It uses two variables for each card:
- **Interval (I)**: The number of days until the next review.
- **Ease Factor (F)**: A percentage that determines how quickly the interval grows. Starts at 250%.

#### Button Actions (Review Phase)
- **Again (Lapse)**:
    - The card is considered forgotten.
    - It re-enters the "Learning" phase (e.g., to be seen in 10 minutes).
    - The Ease Factor (F) is penalized (e.g., drops from 250% to 230%).
- **Hard**:
    - The new interval is slightly longer than the previous one (e.g., `I * 1.2`).
    - The Ease Factor (F) is slightly penalized (e.g., drops from 250% to 235%).
- **Good**:
    - The new interval is calculated as `I * F`.
    - The Ease Factor (F) is maintained.
- **Easy**:
    - The new interval is calculated with a bonus (e.g., `(I * F) * 1.3`).
    - The Ease Factor (F) is increased (e.g., from 250% to 265%).
- **Very Easy**:
    - The new interval is calculated with a maximum bonus (e.g., `(I * F) * 1.8`).
    - The Ease Factor (F) is significantly increased (e.g., from 250% to 280%).
