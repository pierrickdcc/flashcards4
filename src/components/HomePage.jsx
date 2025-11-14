import React, { useState, useMemo, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import { useDataSync } from '../context/DataSyncContext';
import { useUIState } from '../context/UIStateContext';
import { DEFAULT_SUBJECT } from '../constants/app';

import Header from './Header';
import Stats from './Stats';
import Actions from './Actions';
import Filters from './Filters';
import CourseList from './CourseList';
import CardGrid from './CardGrid';
import CardTable from './CardTable';
import Dashboard from './Dashboard';
import MemoWall from './MemoWall';
import ConfigModal from './ConfigModal';
import BulkAddModal from './BulkAddModal';
import AddSubjectModal from './AddSubjectModal';
import AddCardModal from './AddCardModal';
import AddCourseModal from './AddCourseModal';
import DeleteSubjectModal from './DeleteSubjectModal';
import SignOutConfirmationModal from './SignOutConfirmationModal';


const HomePage = ({ isConfigured }) => {
  const navigate = useNavigate();
  const {
    cards,
    subjects,
    deleteCardWithSync,
    updateCardWithSync,
    handleDeleteCardsOfSubject,
    handleReassignCardsOfSubject,
    getCardsToReview,
    signOut
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

  const [view, setView] = useState('courses');
  const [editingCard, setEditingCard] = useState(null);
  const [cardToEdit, setCardToEdit] = useState(null);
  const [cardsToReviewCount, setCardsToReviewCount] = useState(0);

  useEffect(() => {
    const fetchReviewCount = async () => {
      // selectedSubjects is now an array of IDs
      const toReview = await getCardsToReview(selectedSubjects);
      setCardsToReviewCount(toReview.length);
    };
    fetchReviewCount();
  }, [cards, selectedSubjects, getCardsToReview]);

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

  const handleDeleteSubject = (subjectId) => {
    const subject = subjects.find(s => s.id === subjectId);
    if (subject) {
      setSubjectToDelete(subject); // Store the whole subject object
      setShowDeleteSubjectModal(true);
    }
  };

  const confirmDeleteSubject = () => {
    handleDeleteCardsOfSubject(subjectToDelete.id);
    setShowDeleteSubjectModal(false);
    setSubjectToDelete(null);
    setSelectedSubjects(['all']);
  };

  const confirmReassignSubject = () => {
    const defaultSubject = subjects.find(s => s.name === DEFAULT_SUBJECT);
    if (!defaultSubject) {
      toast.error(`La matière par défaut "${DEFAULT_SUBJECT}" est introuvable.`);
      return;
    }
    handleReassignCardsOfSubject(subjectToDelete.id);
    setShowDeleteSubjectModal(false);
    setSubjectToDelete(null);
    setSelectedSubjects([defaultSubject.id]);
  };

  const filteredCards = useMemo(() => {
    if (!cards?.length) return [];

    const term = searchTerm?.toLowerCase().trim();
    return cards.filter(c => {
      // Match by subject_id
      const matchesSubject = selectedSubjects.includes('all') || selectedSubjects.includes(c.subject_id);
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
          startReview={() => navigate('/review/setup')}
          cardsToReviewCount={cardsToReviewCount}
          totalCards={stats.total}
        />

        <Filters
          view={view}
          setView={setView}
          subjects={subjects}
          onDeleteSubject={handleDeleteSubject}
        />

        {view === 'courses' && (
          <CourseList
            onCourseSelect={(course) => navigate(`/course/${course.id}`)}
          />
        )}
        {view === 'cards' && (
          <CardGrid
            filteredCards={filteredCards}
            setEditingCard={handleEditCard}
            deleteCardWithSync={deleteCardWithSync}
            subjects={subjects || []}
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
        {view === 'memos' && (
          <MemoWall />
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
        subjectToDelete={subjectToDelete?.name}
      />

      <SignOutConfirmationModal
        show={showSignOutModal}
        onClose={() => setShowSignOutModal(false)}
        onConfirm={handleSignOut}
      />
    </div>
  );
};

export default HomePage;
