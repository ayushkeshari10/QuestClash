import React from 'react';
import { useBattle } from '../context/BattleContext';
import { Flame } from 'lucide-react';

export default function BattleFeed() {
  const { feedEvents } = useBattle();

  if (feedEvents.length === 0) return null;

  return (
    <div className="battle-feed-container">
      {feedEvents.map(event => (
        <div key={event.id} className="feed-item sketch-border-subtle animate-slide-up">
          <Flame size={14} className="text-primary" />
          <span className="feed-user">{event.username}</span>
          <span className="feed-text">{event.message}</span>
        </div>
      ))}
      <style>{`
        .battle-feed-container {
          position: fixed;
          bottom: 24px;
          right: 24px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          z-index: 50;
          pointer-events: none;
        }
        .feed-item {
          background: #ffffff;
          padding: 8px 16px;
          display: flex;
          align-items: center;
          gap: 6px;
          box-shadow: 2px 2px 0px #000;
          font-size: 13px;
        }
        .feed-user {
          font-weight: bold;
        }
        .animate-slide-up {
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 640px) {
          .battle-feed-container {
            bottom: 80px;
            right: 12px;
            left: 12px;
          }
        }
      `}</style>
    </div>
  );
}
