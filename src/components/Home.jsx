import React from 'react';
import { useBattle } from '../context/BattleContext';

export default function Home({ onPlayClick }) {
  const { activeBattle } = useBattle();

  return (
    <div className="home-wrapper animate-fade-in">
      {/* Welcome Banner */}
      <div className="sketch-border home-hero">
        <h1 className="hero-title">✍️ Welcome to QuestClash!</h1>
        <p className="hero-subtitle">
          Slay your tasks, sketch your progress, and out-produce your opponents in monochrome style!
        </p>
      </div>

      <div className="home-grid-single">
        {/* Rules & Info Card */}
        <div className="sketch-border home-card">
          <h2>📖 Battle Rules & System</h2>
          <ul className="rules-list">
            <li>
              <strong>✅ Completed Tasks</strong>: Award <strong>+1 Point</strong>.
            </li>
            <li>
              <strong>🔴 Can't Do Tasks</strong>: Award <strong>0 Points</strong>.
            </li>
            <li>
              <strong>⏰ Postponed Tasks</strong>: Award <strong>0 Points</strong> until marked complete today.
            </li>
            <li>
              <strong>🏆 Winner</strong>: Determined at exactly <strong>00:00 (Midnight)</strong>.
            </li>
            <li>
              <strong>🔒 Opponent Tasks</strong>: You can see their lists, but you cannot edit or delete them!
            </li>
            <li>
              <strong>👥 Lobby Capacity</strong>: Exactly <strong>3 participants</strong> can enter and compete today.
            </li>
          </ul>
        </div>
      </div>

      {/* Active Battle status banner */}
      <div className="sketch-border home-status-banner">
        {activeBattle ? (
          <div className="status-flex">
            <div>
              <h3>🔥 Battle Active!</h3>
              <p className="text-muted">
                Competing Players: {activeBattle.playerA.username}
                {activeBattle.playerB ? `, ${activeBattle.playerB.username}` : ''}
                {activeBattle.playerC ? `, ${activeBattle.playerC.username}` : ''}
              </p>
            </div>
            <button className="btn-primary" onClick={onPlayClick}>
              Enter Battle Arena
            </button>
          </div>
        ) : (
          <div className="status-flex">
            <div>
              <h3>Lobby Closed</h3>
              <p className="text-muted">You do not have a battle started for today.</p>
            </div>
            <button className="btn-primary" onClick={onPlayClick}>
              Create Battle Lobby
            </button>
          </div>
        )}
      </div>

      <style>{`
        .home-wrapper {
          display: flex;
          flex-direction: column;
          gap: 24px;
          max-width: 800px;
          margin: 0 auto;
          padding: 12px 0;
        }

        .home-hero {
          background: var(--surface-color);
          padding: 32px;
          text-align: center;
          box-shadow: var(--shadow-md);
        }

        .hero-title {
          font-size: 32px;
          margin-bottom: 8px;
        }

        .hero-subtitle {
          font-size: 16px;
          color: var(--text-muted);
        }

        .home-grid-single {
          display: grid;
          grid-template-columns: 1fr;
        }

        .home-card {
          padding: 24px;
          background: var(--surface-color);
          box-shadow: var(--shadow-sm);
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .home-card h2 {
          font-size: 20px;
          border-bottom: 2px solid var(--border-color);
          padding-bottom: 8px;
        }

        .rules-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding-left: 4px;
          font-size: 14px;
        }

        .rules-list li {
          position: relative;
          padding-left: 20px;
        }

        .rules-list li::before {
          content: '•';
          position: absolute;
          left: 4px;
          font-weight: bold;
          font-size: 18px;
        }

        .home-status-banner {
          padding: 20px 28px;
          background: var(--surface-color);
          box-shadow: var(--shadow-md);
        }

        .status-flex {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
        }

        .status-flex h3 {
          font-size: 20px;
        }

        .status-flex p {
          font-size: 13px;
        }

        @media (max-width: 768px) {
          .home-wrapper {
            padding: 12px 16px;
          }
          .home-hero {
            padding: 20px 16px;
          }
          .hero-title {
            font-size: 24px;
          }
          .status-flex {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}
