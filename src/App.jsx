import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { BattleProvider, useBattle } from './context/BattleContext';
import Header from './components/Header';
import BattleHero from './components/BattleHero';
import TaskGrid from './components/TaskGrid';
import History from './components/History';
import Login from './components/Login';
import SetupBattle from './components/SetupBattle';
import Home from './components/Home';
import Sketchpad from './components/Sketchpad';
import BanterChat from './components/BanterChat';
import { AddTaskModal, PostponeModal, DailyReportModal } from './components/Modals';
import Leaderboard from './components/Leaderboard';
import BattleFeed from './components/BattleFeed';
import { playPop } from './soundService';

function AppContent() {
  const { currentUser } = useAuth();
  const { activeBattle, getPlayerIndex, joinActiveBattleLobby } = useBattle();
  const [currentTab, setCurrentTab] = useState('home'); // 'home' | 'dashboard' | 'history'
  
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Global UI click sound for all buttons (using Capture phase so unmounting doesn't cancel it)
  const handleGlobalClick = (e) => {
    if (e.target.closest('button') || e.target.closest('.modal-close')) {
      playPop();
    }
  };

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [postponeTaskId, setPostponeTaskId] = useState(null);

  // Unauthenticated screen
  if (!currentUser) {
    return (
      <main className="guest-layout">
        <Login />
      </main>
    );
  }

  // Render tab content helper
  const renderTabContent = () => {
    switch (currentTab) {
      case 'home':
        return <Home onPlayClick={() => setCurrentTab('dashboard')} />;
      case 'history':
        return <History />;
      case 'leaderboard':
        return <Leaderboard />;
      case 'dashboard':
      default:
        if (!activeBattle) {
          return <SetupBattle />;
        }

        const playerIndex = getPlayerIndex(activeBattle);
        if (playerIndex) {
          // User is already a participant, show the full Arena
          return (
            <div className="dashboard-layout animate-fade-in">
              <BattleHero />
              
              <div className="arena-grid-layout">
                <div className="arena-main-tasks">
                  <TaskGrid 
                    onAddTaskClick={() => setIsAddModalOpen(true)}
                    onPostponeClick={(id) => setPostponeTaskId(id)}
                  />
                </div>
                <div className="arena-sidebar-social">
                  <Sketchpad />
                  <BanterChat />
                </div>
              </div>
              <BattleFeed />
            </div>
          );
        }

        // User is NOT a participant, check if lobby is full (max 3 players)
        const isArenaFull = activeBattle.playerB && activeBattle.playerC;

        if (isArenaFull) {
          return (
            <div className="arena-prompt-container animate-fade-in">
              <div className="sketch-border prompt-card">
                <h2>🔒 Arena is Full!</h2>
                <p>Sorry, the active battle lobby has reached its maximum capacity of 3 participants.</p>
                <button className="btn-primary" onClick={() => setCurrentTab('home')}>
                  Go Back to Home
                </button>
              </div>
              <style>{`
                .arena-prompt-container {
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  min-height: 400px;
                }
                .prompt-card {
                  max-width: 440px;
                  background: var(--surface-color);
                  padding: 32px 24px;
                  text-align: center;
                  display: flex;
                  flex-direction: column;
                  gap: 16px;
                  box-shadow: var(--shadow-md);
                }
              `}</style>
            </div>
          );
        }

        // Open slots exist, prompt to join!
        return (
          <div className="arena-prompt-container animate-fade-in">
            <div className="sketch-border prompt-card">
              <h2>⚔️ Join Active Battle?</h2>
              <p>A battle lobby is active today. Would you like to enter the arena and compete?</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '8px' }}>
                <button className="btn-primary" onClick={joinActiveBattleLobby}>
                  Yes, Join Battle
                </button>
                <button className="btn-secondary" onClick={() => setCurrentTab('home')}>
                  No, Go Back
                </button>
              </div>
            </div>
            <style>{`
              .arena-prompt-container {
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 400px;
              }
              .prompt-card {
                max-width: 440px;
                background: var(--surface-color);
                padding: 32px 24px;
                text-align: center;
                display: flex;
                flex-direction: column;
                gap: 16px;
                box-shadow: var(--shadow-md);
              }
            `}</style>
          </div>
        );
    }
  };

  return (
    <div onClickCapture={handleGlobalClick} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header currentTab={currentTab} setCurrentTab={setCurrentTab} theme={theme} toggleTheme={toggleTheme} />
      
      <main className="app-container">
        {renderTabContent()}
      </main>

      {/* Global Modals */}
      <AddTaskModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />

      <PostponeModal 
        taskId={postponeTaskId}
        isOpen={!!postponeTaskId} 
        onClose={() => setPostponeTaskId(null)} 
      />

      <DailyReportModal />

      <style>{`
        .guest-layout {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-color);
        }

        .app-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 24px;
          min-height: calc(100vh - 80px);
        }

        .arena-grid-layout {
          display: grid;
          grid-template-columns: 1.4fr 1fr;
          gap: 24px;
          margin-top: 16px;
        }
        
        .arena-grid-layout > * {
          min-width: 0;
        }

        @media (max-width: 1024px) {
          .arena-grid-layout {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 640px) {
          .app-container {
            padding: 16px;
            padding-bottom: 96px;
          }
        }
      `}</style>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BattleProvider>
          <AppContent />
        </BattleProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
