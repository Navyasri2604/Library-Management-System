import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar, NavTab } from './components/Sidebar';
import { LoginView } from './components/LoginView';
import { DashboardView } from './components/DashboardView';
import { BooksView } from './components/BooksView';
import { MembersView } from './components/MembersView';
import { CirculationView } from './components/CirculationView';
import { FinesView } from './components/FinesView';
import { AuthorsCategoriesView } from './components/AuthorsCategoriesView';
import { ReportsView } from './components/ReportsView';
import { JavaCodeExportView } from './components/JavaCodeExportView';
import { LibraryStorageService } from './services/storage';
import { User, RoleType } from './types';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');

  // Global circulation modal control
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [returnModalTxId, setReturnModalTxId] = useState<number | null>(null);
  const [preSelectedBookId, setPreSelectedBookId] = useState<number | null>(null);

  // Initialize user from storage on mount
  useEffect(() => {
    const user = LibraryStorageService.getCurrentUser();
    setCurrentUser(user);
  }, []);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setCurrentTab('dashboard');
  };

  const handleLogout = () => {
    LibraryStorageService.logout();
    setCurrentUser(null);
  };

  const handleSwitchRole = (role: RoleType) => {
    const matched = LibraryStorageService.login(role === 'ROLE_ADMIN' ? 'admin' : 'librarian');
    if (matched) {
      setCurrentUser(matched);
      // If switching to librarian and on admin-only tab, revert to dashboard
      if (role === 'ROLE_LIBRARIAN' && (currentTab === 'taxonomy' || currentTab === 'reports')) {
        setCurrentTab('dashboard');
      }
    }
  };

  const handleResetData = () => {
    if (window.confirm('Reset all library data (books, members, loans, fines) to fresh seed state?')) {
      LibraryStorageService.resetToDefault();
      setCurrentUser(LibraryStorageService.getCurrentUser());
      window.location.reload();
    }
  };

  const handleOpenIssueModal = (bookId?: number) => {
    if (bookId) {
      setPreSelectedBookId(bookId);
    } else {
      setPreSelectedBookId(null);
    }
    setIsIssueModalOpen(true);
  };

  const handleOpenReturnModal = (txId?: number) => {
    if (txId) {
      setReturnModalTxId(txId);
    } else {
      // Find the first active transaction or navigate to circulation tab
      const txs = LibraryStorageService.getTransactions().filter(t => t.status !== 'RETURNED');
      if (txs.length > 0) {
        setReturnModalTxId(txs[0].id);
      } else {
        setCurrentTab('circulation');
      }
    }
  };

  // If user is not authenticated, display LoginView
  if (!currentUser) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen theme-canvas flex flex-col font-sans transition-colors duration-200">
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        onLogout={handleLogout}
        onSwitchRole={handleSwitchRole}
        onResetData={handleResetData}
      />

      {/* Main Body */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto">
        {/* Navigation Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          role={currentUser.role}
        />

        {/* Content View Area */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {currentTab === 'dashboard' && (
            <DashboardView
              role={currentUser.role}
              onNavigate={setCurrentTab}
              onOpenIssueModal={() => handleOpenIssueModal()}
              onOpenReturnModal={handleOpenReturnModal}
            />
          )}

          {currentTab === 'circulation' && (
            <CirculationView
              role={currentUser.role}
              isIssueModalOpen={isIssueModalOpen}
              onCloseIssueModal={() => setIsIssueModalOpen(false)}
              returnModalTxId={returnModalTxId}
              onCloseReturnModal={() => setReturnModalTxId(null)}
              preSelectedBookId={preSelectedBookId}
            />
          )}

          {currentTab === 'books' && (
            <BooksView
              role={currentUser.role}
              onOpenIssueModalWithBook={(bookId) => {
                setCurrentTab('circulation');
                handleOpenIssueModal(bookId);
              }}
            />
          )}

          {currentTab === 'members' && (
            <MembersView role={currentUser.role} />
          )}

          {currentTab === 'fines' && (
            <FinesView role={currentUser.role} />
          )}

          {currentTab === 'taxonomy' && (
            <AuthorsCategoriesView role={currentUser.role} />
          )}

          {currentTab === 'reports' && (
            <ReportsView />
          )}

          {currentTab === 'java-code' && (
            <JavaCodeExportView />
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/60 py-3 px-6 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto w-full">
        <div>
          Library Management System • Fully Functional Production Model
        </div>
        <div className="text-[11px] text-slate-400 font-mono mt-1 sm:mt-0">
          Java 17 • Spring Boot 3.3.4 • MySQL 8 • Spring Security • ₹5/day Fine Engine
        </div>
      </footer>
    </div>
  );
}
