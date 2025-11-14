import React, { useState } from 'react';

const ReviewSessionSetup = ({ onStartReview, onClose }) => {
  const [isCramMode, setIsCramMode] = useState(false);
  const [includeFuture, setIncludeFuture] = useState(false);

  const handleStart = () => {
    onStartReview({ isCramMode, includeFuture });
  };

  return (
    <div className="review-setup-container">
      <h2>Configurer la session de révision</h2>

      <div className="setup-options">
        <div className="option-group">
          <p className="option-label">Quelles cartes réviser ?</p>
          <div className="radio-option">
            <input
              type="radio"
              id="review-due"
              name="card-selection"
              checked={!includeFuture}
              onChange={() => setIncludeFuture(false)}
            />
            <label htmlFor="review-due">Seulement les cartes dues aujourd'hui</label>
          </div>
          <div className="radio-option">
            <input
              type="radio"
              id="review-all"
              name="card-selection"
              checked={includeFuture}
              onChange={() => setIncludeFuture(true)}
            />
            <label htmlFor="review-all">Toutes les cartes (étude ciblée)</label>
          </div>
        </div>

        <div className="option-group">
          <p className="option-label">Options</p>
          <div className="option-item">
            <input
              type="checkbox"
              id="cram-mode-checkbox"
              checked={isCramMode}
              onChange={(e) => setIsCramMode(e.target.checked)}
            />
            <label htmlFor="cram-mode-checkbox">
              Mode bachotage <span className="text-muted">(la progression ne sera pas sauvegardée)</span>
            </label>
          </div>
        </div>
      </div>

      <div className="setup-actions">
        <button onClick={handleStart} className="btn-primary start-review-btn">
          Démarrer la révision
        </button>
        <button onClick={onClose} className="btn-secondary">
          Annuler
        </button>
      </div>
    </div>
  );
};

export default ReviewSessionSetup;
