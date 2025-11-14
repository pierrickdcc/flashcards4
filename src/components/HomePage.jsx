import React from 'react';
import { Toaster } from 'react-hot-toast';
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
import { useNavigate } from 'react-router-dom';

const HomePage = ({
  isConfigured,
  setShowSignOutModal,
  stats,
  startReview,
  selectedSubjects,
  cardsToReviewCount,
  totalCards,
  view,
  setView,
  subjects,
  handleDeleteSubject,
  filteredCards,
  handleEditCard,
  deleteCardWithSync,
  editingCard,
  setEditingCard,
  updateCardWithSync,
  showConfigModal,
  setShowConfigModal,
  showBulkModal,
  setShowBulkModal,
  showAddSubjectModal,
  setShowAddSubjectModal,
  showAddCardModal,
  setShowAddCardModal,
  setCardToEdit,
  cardToEdit,
  showAddCourseModal,
  setShowAddCourseModal,
  showDeleteSubjectModal,
  setShowDeleteSubjectModal,
  confirmDeleteSubject,
  confirmReassignSubject,
  subjectToDelete,
  showSignOutModal,
  handleSignOut,
}) => {
  const navigate = useNavigate();

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
          startReview={startReview}
          cardsToReviewCount={cardsToReviewCount}
          totalCards={totalCards}
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
          />
        )}
        {view === 'table' && (
          <CardTable
            filteredCards={filteredCards}
            editingCard={editingCard}
            setEditingCard={setEditingCard}
            updateCardWithSync={updateCardWithSync}
            deleteCardWithSync={deleteCardWithSync}
            subjects={subjects}
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

export default HomePage;
