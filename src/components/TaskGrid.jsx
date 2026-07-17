import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useBattle } from '../context/BattleContext';
import TaskCard from './TaskCard';
import { Plus, Swords, User, UserPlus } from 'lucide-react';

export default function TaskGrid({ onAddTaskClick, onPostponeClick }) {
  const { currentUser } = useAuth();
  const { activeBattle, updateTaskStatus } = useBattle();
  const [mobileTab, setMobileTab] = useState('mine'); // 'mine' | 'oppB' | 'oppC'

  if (!activeBattle) return null;

  const { playerA, playerB, playerC } = activeBattle;
  
  // Resolve who I am and map participants
  const isPlayerA = playerA.id === currentUser?.id || playerA.username.toLowerCase() === currentUser?.username.toLowerCase();
  const isPlayerB = playerB && (playerB.id === currentUser?.id || playerB.username.toLowerCase() === currentUser?.username.toLowerCase());
  const isPlayerC = playerC && (playerC.id === currentUser?.id || playerC.username.toLowerCase() === currentUser?.username.toLowerCase());

  let myData = null;
  let oppBData = null;
  let oppCData = null;

  if (isPlayerA) {
    myData = playerA;
    oppBData = playerB;
    oppCData = playerC;
  } else if (isPlayerB) {
    myData = playerB;
    oppBData = playerA;
    oppCData = playerC;
  } else if (isPlayerC) {
    myData = playerC;
    oppBData = playerA;
    oppCData = playerB;
  }

  // Sorting helper: Pending first, then by time
  const sortTasks = (tasksList = []) => {
    return [...tasksList].sort((a, b) => {
      if (a.status === 'pending' && b.status !== 'pending') return -1;
      if (a.status !== 'pending' && b.status === 'pending') return 1;
      return a.time.localeCompare(b.time);
    });
  };

  const myTasks = myData ? sortTasks(myData.tasks) : [];
  const oppBTasks = oppBData ? sortTasks(oppBData.tasks) : [];
  const oppCTasks = oppCData ? sortTasks(oppCData.tasks) : [];

  return (
    <div className="task-grid-container">
      {/* Mobile Tab Selectors */}
      <div className="mobile-tab-selectors sketch-border-subtle">
        <button
          className={`mobile-tab-btn ${mobileTab === 'mine' ? 'active' : ''}`}
          onClick={() => setMobileTab('mine')}
        >
          <User size={13} style={{ flexShrink: 0 }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Mine ({myTasks.length})</span>
        </button>
        <button
          className={`mobile-tab-btn ${mobileTab === 'oppB' ? 'active' : ''}`}
          onClick={() => setMobileTab('oppB')}
          disabled={!oppBData}
        >
          {oppBData ? <Swords size={13} style={{ flexShrink: 0 }} /> : <UserPlus size={13} style={{ flexShrink: 0 }} />}
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{oppBData ? oppBData.username : 'Empty'} ({oppBTasks.length})</span>
        </button>
        <button
          className={`mobile-tab-btn ${mobileTab === 'oppC' ? 'active' : ''}`}
          onClick={() => setMobileTab('oppC')}
          disabled={!oppCData}
        >
          {oppCData ? <Swords size={13} style={{ flexShrink: 0 }} /> : <UserPlus size={13} style={{ flexShrink: 0 }} />}
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{oppCData ? oppCData.username : 'Empty'} ({oppCTasks.length})</span>
        </button>
      </div>

      {/* Grid columns: 3-column layout */}
      <div className="task-columns-layout layout-three-cols">
        
        {/* Column 1: My Checklist */}
        <div className={`task-column ${mobileTab === 'mine' ? 'mobile-visible' : 'mobile-hidden'}`}>
          <div className="column-header">
            <div className="column-title-container">
              <h3 className="column-title">My Checklist</h3>
              <span className="column-counter font-mono">{myTasks.filter(t => t.status === 'completed').length}/{myTasks.length}</span>
            </div>
            {activeBattle.status === 'active' && (
              <button className="add-task-inline" onClick={onAddTaskClick}>
                <Plus size={14} />
                <span>Add Task</span>
              </button>
            )}
          </div>

          <div className="tasks-scroll-area">
            {myTasks.length === 0 ? (
              <div className="empty-tasks-placeholder sketch-border">
                <p className="empty-title">Checklist is empty</p>
                <p className="empty-sub">Get drawing on your productivity today!</p>
                {activeBattle.status === 'active' && (
                  <button className="btn-primary inline-btn" onClick={onAddTaskClick}>
                    <Plus size={14} />
                    <span>Create Task</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="tasks-grid-list">
                {myTasks.map((t) => (
                  <TaskCard
                    key={t.id}
                    task={t}
                    readOnly={activeBattle.status === 'frozen'}
                    onComplete={(id) => updateTaskStatus(id, 'completed')}
                    onFail={(id) => updateTaskStatus(id, 'failed')}
                    onPostpone={onPostponeClick}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Column 2: Opponent B Checklist */}
        <div className={`task-column opponent-column ${mobileTab === 'oppB' ? 'mobile-visible' : 'mobile-hidden'}`}>
          <div className="column-header">
            <div className="column-title-container">
              <h3 className="column-title">
                {oppBData ? `${oppBData.username}'s List` : "Opponent 1"}
              </h3>
              {oppBData && (
                <span className="column-counter font-mono">
                  {oppBTasks.filter(t => t.status === 'completed').length}/{oppBTasks.length}
                </span>
              )}
            </div>
            {oppBData && (
              <span className="opponent-tag-badge sketch-border-subtle">Read-only</span>
            )}
          </div>

          <div className="tasks-scroll-area">
            {!oppBData ? (
              <div className="empty-tasks-placeholder sketch-border">
                <div className="avatar-waiting-ring animate-float">
                  <UserPlus size={20} />
                </div>
                <p className="empty-title">Awaiting Challenger</p>
                <p className="empty-sub">Open your friend's Arena to join this battle!</p>
              </div>
            ) : oppBTasks.length === 0 ? (
              <div className="empty-tasks-placeholder sketch-border">
                <p className="empty-title">List is empty</p>
                <p className="empty-sub">No tasks added by {oppBData.username} yet.</p>
              </div>
            ) : (
              <div className="tasks-grid-list">
                {oppBTasks.map((t) => (
                  <TaskCard
                    key={t.id}
                    task={t}
                    readOnly={true}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Column 3: Opponent C Checklist */}
        <div className={`task-column opponent-column ${mobileTab === 'oppC' ? 'mobile-visible' : 'mobile-hidden'}`}>
          <div className="column-header">
            <div className="column-title-container">
              <h3 className="column-title">
                {oppCData ? `${oppCData.username}'s List` : "Opponent 2"}
              </h3>
              {oppCData && (
                <span className="column-counter font-mono">
                  {oppCTasks.filter(t => t.status === 'completed').length}/{oppCTasks.length}
                </span>
              )}
            </div>
            {oppCData && (
              <span className="opponent-tag-badge sketch-border-subtle">Read-only</span>
            )}
          </div>

          <div className="tasks-scroll-area">
            {!oppCData ? (
              <div className="empty-tasks-placeholder sketch-border">
                <div className="avatar-waiting-ring animate-float">
                  <UserPlus size={20} />
                </div>
                <p className="empty-title">Awaiting Challenger 2</p>
                <p className="empty-sub">Open your friend's Arena to join this battle!</p>
              </div>
            ) : oppCTasks.length === 0 ? (
              <div className="empty-tasks-placeholder sketch-border">
                <p className="empty-title">List is empty</p>
                <p className="empty-sub">No tasks added by {oppCData.username} yet.</p>
              </div>
            ) : (
              <div className="tasks-grid-list">
                {oppCTasks.map((t) => (
                  <TaskCard
                    key={t.id}
                    task={t}
                    readOnly={true}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Add Button for Mobile */}
      {activeBattle.status === 'active' && (
        <button className="floating-add-btn" onClick={onAddTaskClick} title="Add New Task">
          <Plus size={24} />
        </button>
      )}

      <style>{`
        .task-grid-container {
          position: relative;
          min-height: 400px;
        }

        .mobile-tab-selectors {
          display: none;
          gap: 8px;
          margin-bottom: 20px;
          padding: 4px;
          background: var(--surface-color);
          border-radius: 12px;
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }

        .mobile-tab-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          padding: 8px;
          font-size: 11px;
          box-shadow: none;
          border: none;
          border-radius: 6px;
          min-width: 0;
        }

        .mobile-tab-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .mobile-tab-btn.active {
          background: var(--text-primary);
          color: var(--bg-color);
        }

        .task-columns-layout {
          display: grid;
          gap: 20px;
        }

        .layout-three-cols {
          grid-template-columns: 1fr 1fr 1fr;
        }

        .task-column {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .column-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .column-title-container {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .column-title {
          font-size: 16px;
          font-weight: 700;
        }

        .column-counter {
          font-size: 11px;
          border: 1.5px solid #000;
          padding: 1px 6px;
          border-radius: 99px;
          font-weight: 700;
        }

        .add-task-inline {
          padding: 4px 8px;
          font-size: 11px;
        }

        .opponent-tag-badge {
          font-family: var(--font-header);
          font-size: 10px;
          font-weight: 700;
          padding: 2px 6px;
          box-shadow: 1px 1px 0px var(--border-color);
        }

        .tasks-scroll-area {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .tasks-grid-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .empty-tasks-placeholder {
          background: var(--surface-color);
          padding: 24px 12px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6px;
          min-height: 200px;
        }

        .empty-title {
          font-size: 14px;
          font-weight: 700;
        }

        .empty-sub {
          color: var(--text-muted);
          font-size: 12px;
          max-width: 180px;
        }

        .inline-btn {
          font-size: 11px;
          padding: 4px 10px;
          margin-top: 4px;
        }

        .avatar-waiting-ring {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 2px dashed #000;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 4px;
        }

        .invite-code-box {
          border: 1.5px dashed #000;
          padding: 2px 10px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 700;
          margin-top: 4px;
        }

        .floating-add-btn {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: var(--text-primary);
          color: var(--bg-color);
          display: none;
          align-items: center;
          justify-content: center;
          box-shadow: var(--shadow-sm);
          z-index: 99;
        }

        .floating-add-btn:hover {
          transform: translate(-1px, -1px);
          box-shadow: var(--shadow-md);
        }

        @media (max-width: 1024px) {
          .task-columns-layout {
            grid-template-columns: 1fr !important;
            gap: 20px;
          }
          .opponent-column {
            border-top: 2px dashed #000;
            padding-top: 16px;
          }
        }

        @media (max-width: 768px) {
          .mobile-tab-selectors {
            display: grid !important;
          }
          .task-columns-layout {
            grid-template-columns: 1fr !important;
          }
          .opponent-column {
            border: none;
            padding: 0;
          }
          .mobile-hidden {
            display: none;
          }
          .mobile-visible {
            display: flex;
          }
          .floating-add-btn {
            display: flex;
          }
          .add-task-inline {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
