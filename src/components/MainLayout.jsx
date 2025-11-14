import React from 'react';
import AppHeader from './AppHeader';
import NavigationBar from './NavigationBar';
import FloatingActionButton from './FloatingActionButton';

const MainLayout = ({ children }) => {
  return (
    <div className="relative min-h-screen bg-background-body">
      <AppHeader />
      <NavigationBar />
      {/* Add padding-bottom for the mobile nav (h-16 approx) and FAB */}
      <main className="pb-20 md:pb-0">
          {children}
      </main>
      <FloatingActionButton />
    </div>
  );
};

export default MainLayout;
