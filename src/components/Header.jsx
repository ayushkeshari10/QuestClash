import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useBattle } from '../context/BattleContext';
import { Sword, History as HistoryIcon, Home as HomeIcon, Swords, Trophy, Moon, Sun } from 'lucide-react';

export default function Header({ currentTab, setCurrentTab, theme, toggleTheme }) {
  const { currentUser, logout } = useAuth();
  const { countdown, activeBattle, leaveBattle } = useBattle();

  return (
    <header className="main-header sketch-border">
      <div className="header-container">
        {/* Brand Logo */}
        <div className="header-logo" onClick={() => setCurrentTab('home')}>
          <div className="logo-icon-container sketch-border-subtle">
            <Sword className="logo-icon text-primary animate-float" size={18} />
          </div>
          <span className="logo-text">QuestClash</span>
        </div>

        {/* Live Countdown Clock */}
        <div className="header-timer animate-fade-in sketch-border-subtle">
          <span className="timer-label font-mono">Arena Ends In</span>
          <span className="timer-clock font-mono">
            {countdown.hours}:{countdown.minutes}:{countdown.seconds}
          </span>
        </div>

        {/* Navigation Tabs */}
        <nav className="header-nav">
          <button 
            className={`nav-link-btn ${currentTab === 'home' ? 'active' : ''}`}
            onClick={() => setCurrentTab('home')}
          >
            <HomeIcon size={14} />
            <span>Home</span>
          </button>
          <button 
            className={`nav-link-btn ${currentTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setCurrentTab('dashboard')}
          >
            <Swords size={14} />
            <span>Arena</span>
          </button>
          <button 
            className={`nav-link-btn ${currentTab === 'history' ? 'active' : ''}`}
            onClick={() => setCurrentTab('history')}
          >
            <HistoryIcon size={14} />
            <span>History</span>
          </button>
          <button 
            className={`nav-link-btn ${currentTab === 'leaderboard' ? 'active' : ''}`}
            onClick={() => setCurrentTab('leaderboard')}
          >
            <Trophy size={14} />
            <span>Ranks</span>
          </button>
        </nav>

        {/* Profile and Logout */}
        <div className="header-actions">
          <button 
            className="theme-toggle-btn sketch-border-subtle" 
            onClick={toggleTheme}
            title="Toggle Dark Mode"
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>

          {currentUser && activeBattle && (
            <button 
              onClick={leaveBattle} 
              className="leave-lobby-btn font-mono"
              title="Leave active battle lobby"
            >
              Quit Lobby
            </button>
          )}

          {currentUser ? (
            <div className="user-profile sketch-border-subtle">
              <img src={currentUser.avatar} alt={currentUser.username} className="user-avatar" />
              <div className="user-info-text">
                <span className="user-name">{currentUser.username}</span>
              </div>
              <button onClick={logout} className="logout-btn" title="Sign Out">
                Out
              </button>
            </div>
          ) : (
            <span className="nav-guest">Sign In</span>
          )}
        </div>
      </div>

      <style>{`
        .main-header {
          position: sticky;
          top: 0;
          z-index: 1000;
          background: var(--surface-color);
          border-left: none !important;
          border-right: none !important;
          border-top: none !important;
          padding: 8px 24px;
          border-radius: 0 !important;
        }

        .header-container {
          max-width: 1280px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .header-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          user-select: none;
        }

        .logo-icon-container {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--surface-color);
          box-shadow: 1px 1px 0px var(--border-color);
        }

        .logo-text {
          font-family: var(--font-header);
          font-size: 20px;
          font-weight: 700;
        }

        .header-timer {
          background: var(--surface-color);
          padding: 4px 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 2px 2px 0px var(--border-color);
        }

        .timer-label {
          font-size: 11px;
          font-weight: 700;
          color: var(--text-muted);
        }

        .timer-clock {
          color: var(--text-primary);
          font-size: 13px;
          font-weight: 700;
        }

        .header-nav {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .nav-link-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          font-size: 13px;
          box-shadow: 1px 1px 0px var(--border-color);
          border-radius: 12px 6px 10px 8px / 6px 10px 8px 12px;
        }

        .nav-link-btn:hover {
          transform: translate(-1px, -1px);
          box-shadow: 2px 2px 0px var(--border-color);
        }

        .nav-link-btn.active {
          background: var(--text-primary);
          color: var(--bg-color);
          box-shadow: none;
          transform: none;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 4px 10px;
          background: var(--surface-color);
          box-shadow: 1px 1px 0px var(--border-color);
        }

        .user-avatar {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 1px solid var(--border-color);
          object-fit: cover;
        }

        .user-info-text {
          display: flex;
          flex-direction: column;
        }

        .user-name {
          color: var(--text-primary);
          font-size: 13px;
          font-weight: 700;
        }

        .logout-btn {
          font-size: 11px;
          padding: 2px 6px;
          border-radius: 4px;
          box-shadow: 1px 1px 0px var(--border-color);
        }

        .logout-btn:hover {
          background: var(--failed-glow);
        }

        .leave-lobby-btn {
          font-size: 11px;
          padding: 4px 8px;
          border-radius: 6px;
          box-shadow: 1px 1px 0px var(--border-color);
          font-weight: 700;
        }

        .leave-lobby-btn:hover {
          background: var(--failed-glow);
          transform: translate(-1px, -1px);
          box-shadow: 2px 2px 0px var(--border-color);
        }

        .theme-toggle-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          box-shadow: 1px 1px 0px var(--border-color);
          background: var(--surface-color);
        }

        .theme-toggle-btn:hover {
          transform: translate(-1px, -1px);
          box-shadow: 2px 2px 0px var(--border-color);
        }

        @media (max-width: 900px) {
          .header-nav span, .user-info-text {
            display: none;
          }
        }

        @media (max-width: 768px) {
          .header-container {
            flex-wrap: wrap;
            justify-content: center;
          }
          .header-nav {
            width: 100%;
            justify-content: center;
            order: 3;
            margin-top: 8px;
            margin-bottom: 4px;
          }
          .header-timer {
            display: flex;
            order: 4;
            width: 100%;
            justify-content: center;
          }
          .logo-text {
            font-size: 16px;
          }
        }
      `}</style>
    </header>
  );
}
