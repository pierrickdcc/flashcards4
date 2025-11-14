
import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useDataSync } from './context/DataSyncContext';
import { useUIState } from './context/UIStateContext';

import Auth from './components/Auth';
import ReviewMode from './components/ReviewMode';
import ReviewSessionSetup from './components/ReviewSessionSetup';
import HomePage from './components/HomePage';
import CoursePage from './components/CoursePage';
import FlashcardsPage from './components/FlashcardsPage'; // Import the new page
import MainLayout from './components/MainLayout'; // Import the new layout

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

  // Special case for full-screen review mode
  if (reviewMode && reviewCards.length > 0) {
    return <ReviewMode />;
  }

  // Wrap all other authenticated routes in the MainLayout
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={ <HomePage isConfigured={isConfigured} /> } />
        <Route path="/flashcards" element={<FlashcardsPage />} />
        <Route path="/course/:courseId" element={<CoursePage />} />
        {/* Add other routes here as needed, they will all have the layout */}
        {/* For example:
        <Route path="/courses" element={<CoursesListPage />} />
        <Route path="/memos" element={<MemoWallPage />} />
        <Route path="/stats" element={<StatsPage />} />
        */}
        <Route path="/review/setup" element={
          <ReviewSessionSetup
            onStartReview={handleStartReview}
            onClose={() => navigate('/')}
          />}
        />
      </Routes>
    </MainLayout>
  );
};

export default App;
