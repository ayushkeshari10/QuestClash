import React from 'react';
import { useBattle } from '../context/BattleContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { PlusCircle } from 'lucide-react';

export default function SetupBattle() {
  const { createBattle } = useBattle();
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const handleCreate = async () => {
    try {
      await createBattle();
    } catch (e) {
      toast.error(e.message || 'Failed to create battle');
    }
  };

  return (
    <div className="setup-battle-wrapper">
      <div className="setup-welcome animate-fade-in">
        <span className="setup-hi">Welcome, {currentUser?.username}! 👋</span>
        <h2 className="setup-title">Prepare For Battle</h2>
        <p className="setup-subtitle">Productivity is better when it's a sport. Slay your list today.</p>
      </div>

      <div className="setup-cards-grid">
        {/* Single Card: Create Battle */}
        <div className="sketch-border setup-action-card animate-fade-in">
          <div className="card-badge primary-badge sketch-border-subtle">
            <PlusCircle size={20} />
          </div>
          <h3>Host a Battle</h3>
          <p className="card-desc">Start a battle lobby today. Any of your friends can enter and compete in the arena instantly!</p>
          <button onClick={handleCreate} className="btn-primary card-btn">
            Create Battle Lobby
          </button>
        </div>
      </div>

      {/* Tip Banner */}
      <div className="sketch-border setup-tip-banner animate-fade-in">
        <span className="tip-badge">💡 Multi-Tab Test Tip</span>
        <p>Open a secondary **Incognito / Private tab** side-by-side. Register or login as **Alice** on the second tab, then click the **Arena** tab to enter the lobby you created instantly!</p>
      </div>

      <style>{`
        .setup-battle-wrapper {
          max-width: 500px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 24px;
          padding: 32px 0;
        }

        .setup-welcome {
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .setup-hi {
          color: var(--text-muted);
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .setup-title {
          font-size: 26px;
        }

        .setup-subtitle {
          color: var(--text-muted);
          font-size: 14px;
        }

        .setup-cards-grid {
          display: flex;
          flex-direction: column;
          width: 100%;
        }

        .setup-action-card {
          padding: 32px 24px;
          background: var(--surface-color);
          box-shadow: var(--shadow-sm);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 16px;
        }

        .card-badge {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--surface-color);
          box-shadow: 1px 1px 0px var(--border-color);
        }

        .setup-action-card h3 {
          font-size: 20px;
        }

        .card-desc {
          color: var(--text-muted);
          font-size: 13px;
          line-height: 1.5;
        }

        .card-btn {
          width: 100%;
          padding: 12px;
          font-size: 15px;
        }

        .setup-tip-banner {
          padding: 16px;
          background: var(--surface-color);
          display: flex;
          flex-direction: column;
          gap: 6px;
          box-shadow: var(--shadow-sm);
        }

        .tip-badge {
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
        }

        .setup-tip-banner p {
          font-size: 13px;
          color: var(--text-muted);
          line-height: 1.5;
        }

        @media (max-width: 768px) {
          .setup-battle-wrapper {
            padding: 24px 16px;
          }
        }
      `}</style>
    </div>
  );
}
