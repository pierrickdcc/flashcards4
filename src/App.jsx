
import React, { useState, useMemo, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useDataSync } from './context/DataSyncContext';
import { useUIState } from './context/UIStateContext';
import Auth from './components/Auth';
import ReviewMode from './components/ReviewMode';
import HomePage from './components/HomePage';
import CoursePage from './components/CoursePage';
import { DEFAULT_SUBJECT } from './constants/app';
import toast from 'react-hot-toast';

const App = () => {
  const { session, isConfigured } = useAuth();
  const {
    cards,
    subjects,
    deleteCardWithSync,
    updateCardWithSync,
    handleDeleteCardsOfSubject,
    handleReassignCardsOfSubject,
    signOut,
    getCardsToReview,
    startReview,
  } = useDataSync();
  const {
    showConfigModal,
    setShowConfigModal,
    showBulkAddModal: showBulkModal,
    setShowBulkAddModal: setShowBulkModal,
    showAddSubjectModal,
    setShowAddSubjectModal,
    showAddCardModal,
    setShowAddCardModal,
    showAddCourseModal,
    setShowAddCourseModal,
    reviewMode,
    selectedSubjects,
    setSelectedSubjects,
    searchTerm,
    showSignOutModal, 
    setShowSignOutModal,
    showDeleteSubjectModal,
    setShowDeleteSubjectModal,
    subjectToDelete,
    setSubjectToDelete,
  } = useUIState();

  // --- LOCAL UI STATE ---
  const [view, setView] = useState('courses');
  const [editingCard, setEditingCard] = useState(null);
  const [cardToEdit, setCardToEdit] = useState(null);
  const [cardsToReviewCount, setCardsToReviewCount] = useState(0);

  useEffect(() => {
    const fetchReviewCount = async () => {
      const toReview = await getCardsToReview(selectedSubjects);
      setCardsToReviewCount(toReview.length);
    };
    if (session) {
      fetchReviewCount();
    }
  }, [cards, selectedSubjects, getCardsToReview, session]);

  const handleEditCard = (card) => {
    setCardToEdit(card);
    setShowAddCardModal(true);
  };

  const handleUpdateCard = (updatedData) => {
    if (!editingCard) return;
    updateCardWithSync(editingCard.id, updatedData);
    toast.success("Carte mise à jour !");
    setShowAddCardModal(false);
    setEditingCard(null);
  };

  const handleDeleteSubject = (subjectName) => {
    setSubjectToDelete(subjectName);
    setShowDeleteSubjectModal(true);
  };

  const confirmDeleteSubject = () => {
    handleDeleteCardsOfSubject(subjectToDelete);
    setShowDeleteSubjectModal(false);
    setSubjectToDelete(null);
    setSelectedSubjects(['all']);
  };

  const confirmReassignSubject = () => {
    handleReassignCardsOfSubject(subjectToDelete);
    setShowDeleteSubjectModal(false);
    setSubjectToDelete(null);
    setSelectedSubjects([DEFAULT_SUBJECT]);
  };

  const filteredCards = useMemo(() => {
    if (!cards?.length) return [];

    const term = searchTerm?.toLowerCase().trim();
    return cards.filter(c => {
      const matchesSubject = selectedSubjects.includes('all') || selectedSubjects.includes(c.subject);
      if (!matchesSubject) return false;

      if (!term) return true;
      const q = c.question.toLowerCase();
      const a = c.answer.toLowerCase();
      return q.includes(term) || a.includes(term);
    });
  }, [cards, selectedSubjects, searchTerm]);

  const stats = {
    total: cards?.length || 0,
    toReview: cardsToReviewCount,
    subjects: subjects?.length || 0
  };

  if (!session) {
    return <Auth />;
  }

  if (reviewMode) {
    return <ReviewMode />;
  }

  const handleSignOut = () => {
    signOut();
  };

  return (
    <Routes>
      <Route path="/" element={
        <HomePage
          isConfigured={isConfigured}
          setShowSignOutModal={setShowSignOutModal}
          stats={stats}
          startReview={() => startReview(selectedSubjects)}
          selectedSubjects={selectedSubjects}
          cardsToReviewCount={cardsToReviewCount}
          totalCards={stats.total}
          view={view}
          setView={setView}
          subjects={subjects || []}
          handleDeleteSubject={handleDeleteSubject}
          filteredCards={filteredCards}
          handleEditCard={handleEditCard}
          deleteCardWithSync={deleteCardWithSync}
          editingCard={editingCard}
          setEditingCard={setEditingCard}
          updateCardWithSync={handleUpdateCard}
          showConfigModal={showConfigModal}
          setShowConfigModal={setShowConfigModal}
          showBulkModal={showBulkModal}
          setShowBulkModal={setShowBulkModal}
          showAddSubjectModal={showAddSubjectModal}
          setShowAddSubjectModal={setShowAddSubjectModal}
          showAddCardModal={showAddCardModal}
          setShowAddCardModal={setShowAddCardModal}
          setCardToEdit={setCardToEdit}
          cardToEdit={cardToEdit}
          showAddCourseModal={showAddCourseModal}
          setShowAddCourseModal={setShowAddCourseModal}
          showDeleteSubjectModal={showDeleteSubjectModal}
          setShowDeleteSubjectModal={setShowDeleteSubjectModal}
          confirmDeleteSubject={confirmDeleteSubject}
          confirmReassignSubject={confirmReassignSubject}
          subjectToDelete={subjectToDelete}
          showSignOutModal={showSignOutModal}
          handleSignOut={handleSignOut}
        />
      } />
      <Route path="/course/:courseId" element={<CoursePage />} />
    </Routes>
  );
};

export default App;
