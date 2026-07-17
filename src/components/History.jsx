import React, { useState } from 'react';
import { useBattle } from '../context/BattleContext';
import { Calendar, Trophy, X, Eye } from 'lucide-react';

export default function History() {
  const { historyList } = useBattle();
  const [selectedHistory, setSelectedHistory] = useState(null);

  const getPrioritySymbol = (pr) => {
    switch (pr) {
      case 'high': return '⚠️ High';
      case 'medium': return '▰ Medium';
      default: return '▱ Low';
    }
  };

  const getStatusBoxIcon = (st) => {
    switch (st) {
      case 'completed': return '[✓]';
      case 'failed': return '[✗]';
      case 'postponed': return '[⏰]';
      default: return '[?]';
    }
  };

  const getStatusText = (st) => {
    switch (st) {
      case 'completed': return 'Completed';
      case 'failed': return 'Failed';
      case 'postponed': return 'Postponed';
      default: return 'Pending';
    }
  };

  return (
    <div className="history-page-container animate-fade-in">
      <div className="history-header">
        <h2 className="history-title">Battle History Logs</h2>
        <p className="history-subtitle">Click on any previous day to view full checklist records.</p>
      </div>

      {historyList.length === 0 ? (
        <div className="sketch-border empty-history-card">
          <Calendar size={36} className="animate-float" />
          <h3>No battle records found</h3>
          <p className="text-muted">Complete today's battle to record your first daily battle report!</p>
        </div>
      ) : (
        <div className="history-list-grid">
          {historyList.map((item) => (
            <div 
              key={item.id} 
              className="sketch-border history-item-card" 
              onClick={() => setSelectedHistory(item)}
              title="Click to view checklists"
            >
              {/* Header: Date and Winner Banner */}
              <div className="history-item-header">
                <div className="history-date">
                  <Calendar size={14} className="text-muted" />
                  <span className="font-mono">{item.date}</span>
                </div>
                
                {item.isDraw ? (
                  <span className="history-winner-badge draw sketch-border-subtle">Draw Match</span>
                ) : (
                  <span className="history-winner-badge win sketch-border-subtle">
                    <Trophy size={11} style={{ marginRight: '4px' }} />
                    Winner: {item.winner}
                  </span>
                )}
              </div>

              {/* Body: Player Scores Comparison */}
              <div className="history-scores">
                {/* Player A Stats */}
                <div className="player-score-row">
                  <span className="player-score-name">{item.playerA.username}</span>
                  <div className="player-score-numbers font-mono">
                    <span className="pts-highlight">{item.playerA.points} Pts</span>
                    <span className="pct-muted">({item.playerA.completionRate}%)</span>
                  </div>
                </div>

                <div className="score-divider" />

                {/* Player B Stats */}
                {item.playerB ? (
                  <div className="player-score-row">
                    <span className="player-score-name">{item.playerB.username}</span>
                    <div className="player-score-numbers font-mono">
                      <span className="pts-highlight">{item.playerB.points} Pts</span>
                      <span className="pct-muted">({item.playerB.completionRate}%)</span>
                    </div>
                  </div>
                ) : null}

                {/* Player C Stats */}
                {item.playerC ? (
                  <div className="player-score-row">
                    <span className="player-score-name">{item.playerC.username}</span>
                    <div className="player-score-numbers font-mono">
                      <span className="pts-highlight">{item.playerC.points} Pts</span>
                      <span className="pct-muted">({item.playerC.completionRate}%)</span>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="card-click-hint font-mono">
                <Eye size={12} />
                <span>Click to view details</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DETAILED HISTORY MODAL */}
      {selectedHistory && (
        <div className="modal-overlay">
          <div className="sketch-border modal-card history-detail-modal animate-fade-in">
            <div className="modal-header">
              <h3>⚔️ Battle Details - {selectedHistory.date}</h3>
              <button className="modal-close" onClick={() => setSelectedHistory(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body history-modal-body">
              <div className="winner-announcement sketch-border-subtle">
                {selectedHistory.isDraw ? (
                  <p><strong>Result</strong>: The battle ended in a Draw Match!</p>
                ) : (
                  <p>🏆 <strong>Winner</strong>: {selectedHistory.winner} carried the day!</p>
                )}
              </div>

              <div className="history-participants-details">
                {/* Player A Sheet */}
                <div className="player-detail-sheet sketch-border-subtle">
                  <h4>{selectedHistory.playerA.username} ({selectedHistory.playerA.points} Pts)</h4>
                  <div className="detail-tasks-list">
                    {!selectedHistory.playerA.tasks || selectedHistory.playerA.tasks.length === 0 ? (
                      <p className="no-tasks-hint font-mono">Checklist was empty.</p>
                    ) : (
                      selectedHistory.playerA.tasks.map((t, idx) => (
                        <div key={idx} className={`history-task-row status-text-${t.status}`}>
                          <span className="task-status-box font-mono">{getStatusBoxIcon(t.status)}</span>
                          <span className="task-time font-mono">[{t.time}]</span>
                          <span className="task-pr font-mono">{getPrioritySymbol(t.priority)}</span>
                          <div className="task-content-details">
                            <span className="task-title-text">{t.title}</span>
                            {t.description && <p className="history-task-desc">{t.description}</p>}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Player B Sheet */}
                {selectedHistory.playerB ? (
                  <div className="player-detail-sheet sketch-border-subtle">
                    <h4>{selectedHistory.playerB.username} ({selectedHistory.playerB.points} Pts)</h4>
                    <div className="detail-tasks-list">
                      {!selectedHistory.playerB.tasks || selectedHistory.playerB.tasks.length === 0 ? (
                        <p className="no-tasks-hint font-mono">Checklist was empty.</p>
                      ) : (
                        selectedHistory.playerB.tasks.map((t, idx) => (
                          <div key={idx} className={`history-task-row status-text-${t.status}`}>
                            <span className="task-status-box font-mono">{getStatusBoxIcon(t.status)}</span>
                            <span className="task-time font-mono">[{t.time}]</span>
                            <span className="task-pr font-mono">{getPrioritySymbol(t.priority)}</span>
                            <div className="task-content-details">
                              <span className="task-title-text">{t.title}</span>
                              {t.description && <p className="history-task-desc">{t.description}</p>}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ) : null}

                {/* Player C Sheet */}
                {selectedHistory.playerC ? (
                  <div className="player-detail-sheet sketch-border-subtle">
                    <h4>{selectedHistory.playerC.username} ({selectedHistory.playerC.points} Pts)</h4>
                    <div className="detail-tasks-list">
                      {!selectedHistory.playerC.tasks || selectedHistory.playerC.tasks.length === 0 ? (
                        <p className="no-tasks-hint font-mono">Checklist was empty.</p>
                      ) : (
                        selectedHistory.playerC.tasks.map((t, idx) => (
                          <div key={idx} className={`history-task-row status-text-${t.status}`}>
                            <span className="task-status-box font-mono">{getStatusBoxIcon(t.status)}</span>
                            <span className="task-time font-mono">[{t.time}]</span>
                            <span className="task-pr font-mono">{getPrioritySymbol(t.priority)}</span>
                            <div className="task-content-details">
                              <span className="task-title-text">{t.title}</span>
                              {t.description && <p className="history-task-desc">{t.description}</p>}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .history-page-container {
          max-width: 800px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .history-header {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .history-title {
          font-size: 24px;
          font-weight: 800;
        }

        .history-subtitle {
          color: var(--text-muted);
          font-size: 14px;
        }

        .empty-history-card {
          padding: 48px 24px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          background: #ffffff;
          box-shadow: var(--shadow-sm);
        }

        .empty-history-card h3 {
          font-size: 18px;
        }

        .history-list-grid {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .history-item-card {
          padding: 16px;
          background: #ffffff;
          display: flex;
          flex-direction: column;
          gap: 12px;
          box-shadow: var(--shadow-sm);
          cursor: pointer;
          position: relative;
        }

        .history-item-card:hover {
          transform: translate(-3px, -3px);
          box-shadow: var(--shadow-md);
        }

        .history-item-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          border-bottom: 2px solid #000;
          padding-bottom: 8px;
        }

        .history-date {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--text-muted);
          font-size: 13px;
        }

        .history-winner-badge {
          font-family: var(--font-header);
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          padding: 2px 8px;
          box-shadow: 1px 1px 0px #000;
        }

        .history-winner-badge.win {
          background: #ffffff;
          color: #000;
        }

        .history-winner-badge.draw {
          background: #ffffff;
          color: var(--text-muted);
        }

        .history-scores {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .player-score-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 14px;
        }

        .player-score-name {
          font-weight: 700;
        }

        .player-score-numbers {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .pts-highlight {
          color: #000;
          font-weight: 700;
        }

        .pct-muted {
          color: var(--text-muted);
          font-size: 11px;
        }

        .score-divider {
          height: 1px;
          border-top: 1.5px dashed #000;
        }

        .card-click-hint {
          display: flex;
          align-items: center;
          gap: 4px;
          align-self: flex-end;
          font-size: 10px;
          color: var(--text-muted);
          opacity: 0;
          transition: opacity 0.2s;
        }

        .history-item-card:hover .card-click-hint {
          opacity: 1;
        }

        /* Modal custom layout for history detail */
        .history-detail-modal {
          max-width: 720px;
        }

        .history-modal-body {
          max-height: calc(100vh - 200px);
          overflow-y: auto;
        }

        .winner-announcement {
          padding: 8px 16px;
          background: #f3f4f6;
          font-size: 14px;
          margin-bottom: 12px;
        }

        .history-participants-details {
          display: flex;
          flex-direction: column;
          gap: 16px;
          width: 100%;
        }

        .player-detail-sheet {
          padding: 14px;
          background: #ffffff;
        }

        .player-detail-sheet h4 {
          font-size: 16px;
          border-bottom: 2px solid #000;
          padding-bottom: 4px;
          margin-bottom: 8px;
        }

        .empty-sheet {
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          font-size: 12px;
          padding: 24px;
          border-style: dashed !important;
        }

        .detail-tasks-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .no-tasks-hint {
          color: var(--text-muted);
          font-size: 12px;
        }

        .history-task-row {
          display: grid;
          grid-template-columns: auto auto auto 1fr;
          align-items: flex-start;
          gap: 10px;
          font-size: 13px;
          padding: 6px 0;
          border-bottom: 1px dashed rgba(0,0,0,0.1);
        }

        .task-status-box {
          font-weight: 700;
          font-size: 13px;
        }

        .task-time {
          color: var(--text-muted);
        }

        .task-pr {
          font-size: 11px;
          color: var(--text-muted);
        }

        .task-content-details {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .task-title-text {
          font-weight: 700;
          color: #000;
          font-family: var(--font-body);
        }

        .history-task-desc {
          font-size: 11px;
          color: var(--text-muted);
          line-height: 1.4;
          font-family: var(--font-body);
        }

        /* final statuses colors */
        .status-text-completed .task-title-text {
          text-decoration: line-through;
          color: var(--text-muted);
          opacity: 0.6;
        }
        .status-text-completed .task-status-box {
          color: #22c55e;
        }
        .status-text-failed .task-status-box {
          color: #ef4444;
        }
        .status-text-postponed .task-status-box {
          color: #f59e0b;
        }

        @media (max-width: 640px) {
          .player-score-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 2px;
          }
        }
      `}</style>
    </div>
  );
}
