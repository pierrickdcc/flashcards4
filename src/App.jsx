
import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { useDataSync } from './context/DataSyncContext';
import { useUIState } from './context/UIStateContext';
import Auth from './components/Auth';
import Header from './components/Header';
import DeleteSubjectModal from './components/DeleteSubjectModal';
import Stats from './components/Stats';
import Actions from './components/Actions';
import Filters from './components/Filters';
import CardGrid from './components/CardGrid';
import CardTable from './components/CardTable';
import ReviewMode from './components/ReviewMode';
import ConfigModal from './components/ConfigModal';
import BulkAddModal from './components/BulkAddModal';
import AddSubjectModal from './components/AddSubjectModal';
import AddCardModal from './components/AddCardModal';
import AddCourseModal from './components/AddCourseModal';
import Dashboard from './components/Dashboard';
import CourseViewer from './components/CourseViewer';
import CourseList from './components/CourseList';
import SignOutConfirmationModal from './components/SignOutConfirmationModal';
import { Toaster } from 'react-hot-toast';
import { DEFAULT_SUBJECT } from './constants/app';

const App = () => {
  const { session, isConfigured } = useAuth();
  const {
    cards,
    subjects,
    courses,
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
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [cardsToReviewCount, setCardsToReviewCount] = useState(0);

  useEffect(() => {
    const fetchReviewCount = async () => {
      const toReview = await getCardsToReview(selectedSubjects);
      setCardsToReviewCount(toReview.length);
    };
    fetchReviewCount();
  }, [cards, selectedSubjects, getCardsToReview]);

  const handleEditCard = (card) => {
    setCardToEdit(card);
    setShowAddCardModal(true);
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

  if (selectedCourse) {
    return (
      <CourseViewer
        course={selectedCourse}
        onClose={() => setSelectedCourse(null)}
      />
    );
  }

  if (reviewMode) {
    return <ReviewMode />;
  }

  const handleSignOut = () => {
    signOut();
  };

  return (
    <div>
      <Toaster />
      <Header
        isConfigured={isConfigured}
        setShowSignOutModal={setShowSignOutModal}
      />

      <main style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem 1rem' }}>
        <Stats stats={stats} />
        
        <Actions
          startReview={() => startReview(selectedSubjects)}
          cardsToReviewCount={cardsToReviewCount}
        />
        
        <Filters
          view={view}
          setView={setView}
          subjects={subjects || []}
          onDeleteSubject={handleDeleteSubject}
        />

        {view === 'courses' && (
          <CourseList
            onCourseSelect={setSelectedCourse}
          />
        )}
        {view === 'cards' && (
          <CardGrid
            filteredCards={filteredCards}
            setEditingCard={handleEditCard}
            deleteCardWithSync={deleteCardWithSync}
          />
        )}
        {view === 'table' && (
          <CardTable
            filteredCards={filteredCards}
            editingCard={editingCard}
            setEditingCard={setEditingCard}
            updateCardWithSync={updateCardWithSync}
            deleteCardWithSync={deleteCardWithSync}
            subjects={subjects || []}
          />
        )}
        {view === 'dashboard' && (
          <Dashboard />
        )}
      </main>

      {/* Modals */}
      <ConfigModal
        show={showConfigModal}
        onClose={() => setShowConfigModal(false)}
      />
      
      <BulkAddModal
        show={showBulkModal}
        onClose={() => setShowBulkModal(false)}
      />
      
      <AddSubjectModal
        show={showAddSubjectModal}
        onClose={() => setShowAddSubjectModal(false)}
      />

      <AddCardModal
        show={showAddCardModal}
        onClose={() => {
          setShowAddCardModal(false);
          setCardToEdit(null);
        }}
        cardToEdit={cardToEdit}
      />

      <AddCourseModal
        show={showAddCourseModal}
        onClose={() => setShowAddCourseModal(false)}
      />

      <DeleteSubjectModal
        show={showDeleteSubjectModal}
        onClose={() => setShowDeleteSubjectModal(false)}
        onDelete={confirmDeleteSubject}
        onReassign={confirmReassignSubject}
        subjectToDelete={subjectToDelete}
      />

      <SignOutConfirmationModal
        show={showSignOutModal}
        onClose={() => setShowSignOutModal(false)}
        onConfirm={handleSignOut}
      />
    </div>
  );
};

export default App;
