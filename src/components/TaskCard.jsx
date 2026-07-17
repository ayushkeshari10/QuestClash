import React, { useState, useEffect } from 'react';
import { useBattle } from '../context/BattleContext';
import { Clock, Eye, Trash2 } from 'lucide-react';

export default function TaskCard({ task, onComplete, onFail, onPostpone, readOnly }) {
  const { deleteTask } = useBattle();
  const { title, description, time, priority, status } = task;
  const [canDelete, setCanDelete] = useState(false);

  // Enforce 5-minute task deletion rule
  useEffect(() => {
    if (readOnly || !task.createdAt) return;

    const verifyExpiry = () => {
      const createdTime = new Date(task.createdAt).getTime();
      const currentTime = new Date().getTime();
      const diff = currentTime - createdTime;
      setCanDelete(diff < 5 * 60 * 1000); // 5 minutes in milliseconds
    };

    verifyExpiry();
    const interval = setInterval(verifyExpiry, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, [task.createdAt, readOnly]);

  const getPriorityClass = (pr) => {
    switch (pr) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      default: return 'priority-low';
    }
  };

  const getStatusClass = (st) => {
    switch (st) {
      case 'completed': return 'status-completed';
      case 'failed': return 'status-failed';
      case 'postponed': return 'status-postponed';
      default: return 'status-pending';
    }
  };

  const getStatusIcon = (st) => {
    switch (st) {
      case 'completed':
        return <span>[✓]</span>;
      case 'failed':
        return <span>[✗]</span>;
      case 'postponed':
        return <span>[⏰]</span>;
      default:
        return <span>[?]</span>;
    }
  };

  const hasActions = (status === 'pending') || canDelete;

  return (
    <div className={`glass-card task-card-element sketch-border-subtle status-border-${status} animate-fade-in`}>
      <div className="task-card-header">
        <div className="task-priority-time">
          <span className={`task-badge ${getPriorityClass(priority)}`}>
            {priority}
          </span>
          <span className="task-time font-mono">
            <Clock size={11} className="time-icon" />
            {time}
          </span>
        </div>
        <span className={`task-badge ${getStatusClass(status)}`}>
          {getStatusIcon(status)}
          <span style={{ marginLeft: '4px' }}>{status}</span>
        </span>
      </div>

      <div className="task-card-body">
        <h4 className={`task-title ${status === 'completed' ? 'strike-through' : ''}`}>
          {title}
        </h4>
        {description && <p className="task-description">{description}</p>}
      </div>

      {!readOnly && hasActions && (
        <div className="task-card-actions">
          {status === 'pending' && (
            <>
              <button 
                className="action-btn complete-btn" 
                onClick={() => onComplete(task.id)}
              >
                <span>✓ Complete</span>
              </button>
              
              <button 
                className="action-btn fail-btn" 
                onClick={() => onFail(task.id)}
              >
                <span>✗ Fail</span>
              </button>

              <button 
                className="action-btn postpone-btn" 
                onClick={() => onPostpone(task.id)}
              >
                <span>⏰ Postpone</span>
              </button>
            </>
          )}

          {canDelete && (
            <button 
              className="action-btn delete-btn" 
              onClick={() => deleteTask(task.id)}
            >
              <Trash2 size={11} style={{ marginRight: '2px' }} />
              <span>Delete</span>
            </button>
          )}
        </div>
      )}

      {/* Opponent Locked Card Overlay indicator */}
      {readOnly && (
        <div className="opponent-lock-badge sketch-border-subtle">
          <Eye size={10} />
          <span>LOCKED</span>
        </div>
      )}

      <style>{`
        .task-card-element {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          position: relative;
          background: #ffffff;
        }

        .task-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }

        .task-priority-time {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .task-badge {
          font-family: var(--font-header);
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          padding: 2px 8px;
          border-radius: 4px;
          display: inline-flex;
          align-items: center;
        }

        .task-time {
          color: var(--text-muted);
          font-size: 11px;
          display: flex;
          align-items: center;
          gap: 4px;
          border: 1px solid #000;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .time-icon {
          color: #000;
        }

        .task-card-body {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .task-title {
          font-size: 16px;
          font-weight: 700;
        }

        .task-title.strike-through {
          text-decoration: line-through;
          color: var(--text-muted);
          opacity: 0.6;
        }

        .task-description {
          font-size: 13px;
          color: var(--text-muted);
          line-height: 1.4;
        }

        .task-card-actions {
          display: grid;
          grid-template-columns: 1fr 1.1fr;
          gap: 6px;
          border-top: 1.5px solid #000;
          padding-top: 10px;
          margin-top: 4px;
        }

        .action-btn {
          border-radius: 6px;
          padding: 6px 4px;
          font-size: 11px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #ffffff;
          border: 1.5px solid #000;
          box-shadow: 1px 1px 0px #000;
        }

        .action-btn:hover {
          transform: translate(-1px, -1px);
          box-shadow: 2px 2px 0px #000;
        }

        .complete-btn:hover {
          background: #e2fce6;
        }

        .fail-btn:hover {
          background: #fee2e2;
        }

        .postpone-btn:hover {
          background: #fef3c7;
        }

        .delete-btn {
          border-color: #ef4444;
        }

        .delete-btn:hover {
          background: #fee2e2;
        }

        .opponent-lock-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          background: #ffffff;
          font-family: var(--font-header);
          font-size: 10px;
          font-weight: 700;
          padding: 1px 6px;
          box-shadow: 1px 1px 0px #000;
          display: none;
          align-items: center;
          gap: 4px;
        }

        .task-card-element:hover .opponent-lock-badge {
          display: flex;
        }

        @media (max-width: 640px) {
          .task-card-actions {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
