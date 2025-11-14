import React, { useState, useMemo, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import { useDataSync } from '../context/DataSyncContext';
import { useUIState } from '../context/UIStateContext';

// Import Components
import Header from './Header';
import Stats from './Stats';
import Actions from './Actions';
import Filters from './Filters';
import CourseList from './CourseList';
import CardGrid from './CardGrid';
import CardTable from './CardTable';
import Dashboard from './Dashboard';
import MemoWall from './MemoWall';

// Import Modals
import ConfigModal from './ConfigModal';
import BulkAddModal from './BulkAddModal';
import AddSubjectModal from './AddSubjectModal';
import AddCardModal from './AddCardModal';
import AddCourseModal from './AddCourseModal';
import DeleteSubjectModal from './DeleteSubjectModal';
import SignOutConfirmationModal from './SignOutConfirmationModal';
import MemoModal from './MemoModal';


const HomePage = () => {
  const navigate = useNavigate();
  const {
    cards, subjects, courses, memos,
    deleteCardWithSync, updateCardWithSync,
    handleDeleteCardsOfSubject, getCardsToReview,
    signOut
  } = useDataSync();

  const {
    // All modal states are managed by the context
    showConfigModal, setShowConfigModal,
    showBulkAddModal, setShowBulkAddModal,
    showAddSubjectModal, setShowAddSubjectModal,
    showAddCardModal, setShowAddCardModal,
    showAddCourseModal, setShowAddCourseModal,
    showAddMemoModal, setShowAddMemoModal,
    showDeleteSubjectModal, setShowDeleteSubjectModal,
    showSignOutModal, setShowSignOutModal,

    // Other UI states
    selectedSubjects, searchTerm,
    subjectToDelete, setSubjectToDelete,
    cardToEdit, setCardToEdit,
    editingMemo, setEditingMemo
  } = useUIState();

  const [view, setView] = useState('dashboard'); // Default view is now dashboard
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

  const handleEditMemo = (memo) => {
    setEditingMemo(memo);
    setShowAddMemoModal(true);
  }

  const filteredCards = useMemo(() => {
    if (!cards?.length) return [];
    const term = searchTerm?.toLowerCase().trim();
    return cards.filter(c => {
      const matchesSubject = selectedSubjects.includes('all') || selectedSubjects.includes(c.subject_id);
      if (!matchesSubject) return false;
      if (!term) return true;
      return c.question.toLowerCase().includes(term) || c.answer.toLowerCase().includes(term);
    });
  }, [cards, selectedSubjects, searchTerm]);

  const stats = {
    total: cards?.length || 0,
    toReview: cardsToReviewCount,
    subjects: subjects?.length || 0
  };

  const renderContent = () => {
    switch(view) {
      case 'dashboard': return <Dashboard />;
      case 'courses': return <CourseList onCourseSelect={(course) => navigate(`/course/${course.id}`)} />;
      case 'cards': return <CardGrid filteredCards={filteredCards} setEditingCard={handleEditCard} deleteCardWithSync={deleteCardWithSync} subjects={subjects || []} />;
      case 'table': return <CardTable filteredCards={filteredCards} setEditingCard={handleEditCard} deleteCardWithSync={deleteCardWithSync} subjects={subjects || []} />;
      case 'memos': return <MemoWall onMemoSelect={handleEditMemo} />;
      default: return <Dashboard />;
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster position="bottom-center" toastOptions={{
        style: { background: 'var(--card-bg)', color: 'var(--text-color)' }
      }}/>
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <Stats stats={stats} />
        <Actions
          startReview={() => navigate('/review/setup')}
          cardsToReviewCount={cardsToReviewCount}
        />
        <Filters view={view} setView={setView} />

        {renderContent()}
      </main>

      {/* All Modals */}
      {showConfigModal && <ConfigModal show={showConfigModal} onClose={() => setShowConfigModal(false)} />}
      {showBulkAddModal && <BulkAddModal show={showBulkAddModal} onClose={() => setShowBulkAddModal(false)} />}
      {showAddSubjectModal && <AddSubjectModal show={showAddSubjectModal} onClose={() => setShowAddSubjectModal(false)} />}
      {showAddCourseModal && <AddCourseModal show={showAddCourseModal} onClose={() => setShowAddCourseModal(false)} />}
      {showAddCardModal && <AddCardModal show={showAddCardModal} onClose={() => { setShowAddCardModal(false); setCardToEdit(null); }} cardToEdit={cardToEdit} />}
      {showAddMemoModal && <MemoModal show={showAddMemoModal} onClose={() => { setShowAddMemoModal(false); setEditingMemo(null); }} memoToEdit={editingMemo} />}
      {showDeleteSubjectModal && <DeleteSubjectModal show={showDeleteSubjectModal} onClose={() => setShowDeleteSubjectModal(false)} subjectToDelete={subjectToDelete} />}
      {showSignOutModal && <SignOutConfirmationModal show={showSignOutModal} onClose={() => setShowSignOutModal(false)} onConfirm={signOut} />}
    </div>
  );
};

export default HomePage;