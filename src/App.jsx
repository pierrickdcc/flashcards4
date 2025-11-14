
import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useDataSync } from './context/DataSyncContext';
import { useUIState } from './context/UIStateContext';

import Auth from './components/Auth';
import ReviewMode from './components/ReviewMode';
import ReviewSessionSetup from './components/ReviewSessionSetup';
import HomePage from './components/HomePage';
import CoursePage from './components/CoursePage';

const App = () => {
  const { session, isConfigured } = useAuth();
  const { startReview } = useDataSync();
  const { reviewMode, reviewCards, selectedSubjects } = useUIState();
  const navigate = useNavigate();

  if (!session) {
    return <Auth />;
  }

  const handleStartReview = async (options) => {
    const success = await startReview(selectedSubjects, options.isCramMode, options.includeFuture);
    if (success) {
      navigate('/'); // Navigate back to home to trigger the review mode display
    }
  };

  // Main routing logic
  if (reviewMode && reviewCards.length > 0) {
    return <ReviewMode />;
  }

  return (
    <Routes>
      <Route path="/" element={ <HomePage isConfigured={isConfigured} /> } />
      <Route path="/course/:courseId" element={<CoursePage />} />
      <Route path="/review/setup" element={
        <ReviewSessionSetup
          onStartReview={handleStartReview}
          onClose={() => navigate('/')}
        />}
      />
    </Routes>
  );
};

export default App;
