import React from 'react';
import AppHeader from './AppHeader';
import NavigationBar from './NavigationBar';
import FloatingActionButton from './FloatingActionButton';
import StatsBanner from './StatsBanner';

// Import all modals
import AddContentModal from './AddContentModal';
import AddCardModal from './AddCardModal';
import AddCourseModal from './AddCourseModal';
import BulkAddModal from './BulkAddModal';
import AddSubjectModal from './AddSubjectModal';
import ConfigModal from './ConfigModal';
import DeleteSubjectModal from './DeleteSubjectModal';
import SignOutConfirmationModal from './SignOutConfirmationModal';
import MemoModal from './MemoModal';

const MainLayout = ({ children }) => {
  return (
    <div className="relative min-h-screen bg-background-body">
      <AppHeader />
      <StatsBanner />
      <NavigationBar />
      <main className="pb-20 md:pb-0">
          {children}
      </main>
      <FloatingActionButton />

      {/* Render all modals here */}
      <AddContentModal />
      <AddCardModal />
      <AddCourseModal />
      <BulkAddModal />
      <AddSubjectModal />
      <ConfigModal />
      <DeleteSubjectModal />
      <SignOutConfirmationModal />
      <MemoModal />
    </div>
  );
};

export default MainLayout;
