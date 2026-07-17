import React, { useState, useEffect } from 'react';
import { useBattle } from '../context/BattleContext';
import { useToast } from '../context/ToastContext';
import { Calendar, Clock, Lock, Star, Trophy, X, Wand2 } from 'lucide-react';
import confetti from 'canvas-confetti';

// ----------------------------------------------------
// 1. ADD TASK MODAL
// ----------------------------------------------------
export function AddTaskModal({ isOpen, onClose }) {
  const { addTask } = useBattle();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [time, setTime] = useState('09:00');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const { toast } = useToast();

  if (!isOpen) return null;

  const handleAIBreakdown = async () => {
    if (!title.trim()) {
      toast.error("Enter a main task title first to break it down!");
      return;
    }
    setIsAiLoading(true);
    try {
      const { breakDownTaskWithAI } = await import('../aiService');
      const subtasks = await breakDownTaskWithAI(title);
      
      for (const sub of subtasks) {
        await addTask(sub, `AI Subtask of: ${title}`, priority, time);
      }
      
      toast.success("AI broke down your goal into actionable tasks!");
      setTitle('');
      setDescription('');
      onClose();
    } catch (err) {
      toast.error(err.message || "AI Breakdown failed");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    addTask(title, description, priority, time);
    // Reset form
    setTitle('');
    setDescription('');
    setPriority('medium');
    setTime('09:00');
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="sketch-border modal-card animate-fade-in">
        <div className="modal-header">
          <h3>Create New Task</h3>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="task-title">Task Title</label>
            <input 
              type="text" 
              id="task-title" 
              placeholder="e.g. Design Dashboard sketch" 
              value={title} 
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="task-desc">Description (Optional)</label>
            <textarea 
              id="task-desc" 
              placeholder="e.g. Finalize rough outlines..." 
              value={description} 
              onChange={e => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Priority</label>
              <div className="priority-selector">
                {['low', 'medium', 'high'].map(p => (
                  <button
                    key={p}
                    type="button"
                    className={`priority-btn select-${p} ${priority === p ? 'active' : ''}`}
                    onClick={() => setPriority(p)}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="task-time">Time</label>
              <input 
                type="time" 
                id="task-time" 
                value={time} 
                onChange={e => setTime(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
            <button 
              type="button" 
              className="btn-secondary form-submit"
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              onClick={handleAIBreakdown}
              disabled={isAiLoading}
            >
              <Wand2 size={16} /> {isAiLoading ? 'Thinking...' : 'AI Breakdown'}
            </button>
            <button type="submit" className="btn-primary form-submit" style={{ flex: 1 }} disabled={isAiLoading}>
              Add Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 2. POSTPONE MODAL
// ----------------------------------------------------
export function PostponeModal({ taskId, isOpen, onClose }) {
  const { postponeTask } = useBattle();
  const [customTime, setCustomTime] = useState('14:00');

  if (!isOpen) return null;

  const handleQuickPostpone = (hours) => {
    const now = new Date();
    now.setHours(now.getHours() + hours);
    const hrs = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    postponeTask(taskId, `${hrs}:${mins}`);
    onClose();
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    postponeTask(taskId, customTime);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="sketch-border modal-card animate-fade-in small-modal">
        <div className="modal-header">
          <h3>⏰ Postpone Task</h3>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="modal-body">
          <p className="modal-hint">Select a time later today to complete this task.</p>
          
          <div className="quick-postpone-grid">
            <button className="btn-secondary quick-btn" onClick={() => handleQuickPostpone(1)}>+1 Hr</button>
            <button className="btn-secondary quick-btn" onClick={() => handleQuickPostpone(3)}>+3 Hrs</button>
            <button className="btn-secondary quick-btn" onClick={() => handleQuickPostpone(5)}>+5 Hrs</button>
          </div>

          <div className="modal-separator font-mono">Or Set Custom</div>

          <form onSubmit={handleCustomSubmit} className="modal-form" style={{ padding: 0 }}>
            <div className="form-row align-end">
              <div className="form-group flex-grow">
                <label htmlFor="postpone-time">New Time Today</label>
                <input 
                  type="time" 
                  id="postpone-time" 
                  value={customTime} 
                  onChange={e => setCustomTime(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn-primary inline-submit-btn">
                Confirm
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 3. DAILY REPORT / FREEZE MODAL (Supports 3 Competitors)
// ----------------------------------------------------
export function DailyReportModal() {
  const { activeBattle, startNewBattleDay } = useBattle();

  if (!activeBattle || activeBattle.status !== 'frozen' || !activeBattle.report) return null;

  const { report } = activeBattle;
  const isDraw = report.isDraw;

  // CONFETTI CELEBRATION EFFECT
  useEffect(() => {
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#000000', '#666666', '#999999'] // Sketchy monochrome confetti
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#000000', '#666666', '#999999']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, [report]);

  return (
    <div className="report-overlay animate-fade-in">
      <div className="sketch-border report-card animate-float">
        <div className="report-badge-container sketch-border-subtle">
          <Trophy size={36} className="report-trophy-icon" />
        </div>

        <h2 className="report-title">🏆 Daily Battle Result</h2>
        
        {isDraw ? (
          <div className="report-winner-banner draw sketch-border-subtle">
            <h3>It's a Draw Match!</h3>
            <p>Checklists tied. Speed and focus were matched today!</p>
          </div>
        ) : (
          <div className="report-winner-banner win sketch-border-subtle">
            {report.winnerAvatar && (
              <div className="winner-avatar-ring sketch-border-subtle">
                <img src={report.winnerAvatar} alt={report.winner} className="winner-avatar" />
              </div>
            )}
            <h3>{report.winner} Wins Today!</h3>
            <p>Master productivity champion. Keep up the high-contrast streak!</p>
          </div>
        )}

        {/* Players side-by-side stats comparison */}
        <div className="report-comparison">
          {/* Player A Stats */}
          <div className="report-player-card sketch-border-subtle">
            <h4 className="report-player-name">{report.playerA.username}</h4>
            <div className="report-stats-grid">
              <div className="stat-row">
                <span className="stat-label">Score</span>
                <span className="stat-val font-mono">{report.playerA.points} Pts</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Done</span>
                <span className="stat-val font-mono">{report.playerA.completionRate}%</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Completed</span>
                <span className="stat-val font-mono">{report.playerA.completed}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Failed</span>
                <span className="stat-val font-mono">{report.playerA.failed}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Postponed</span>
                <span className="stat-val font-mono">{report.playerA.postponed}</span>
              </div>
            </div>
          </div>

          {/* Player B Stats */}
          {report.playerB ? (
            <div className="report-player-card sketch-border-subtle">
              <h4 className="report-player-name">{report.playerB.username}</h4>
              <div className="report-stats-grid">
                <div className="stat-row">
                  <span className="stat-label">Score</span>
                  <span className="stat-val font-mono">{report.playerB.points} Pts</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Done</span>
                  <span className="stat-val font-mono">{report.playerB.completionRate}%</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Completed</span>
                  <span className="stat-val font-mono">{report.playerB.completed}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Failed</span>
                  <span className="stat-val font-mono">{report.playerB.failed}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Postponed</span>
                  <span className="stat-val font-mono">{report.playerB.postponed}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="report-player-card empty-card sketch-border-subtle font-mono">
              <div className="lock-icon-wrapper sketch-border-subtle">
                <Lock size={14} />
              </div>
              <h4>No Opponent 1</h4>
            </div>
          )}

          {/* Player C Stats */}
          {report.playerC ? (
            <div className="report-player-card sketch-border-subtle">
              <h4 className="report-player-name">{report.playerC.username}</h4>
              <div className="report-stats-grid">
                <div className="stat-row">
                  <span className="stat-label">Score</span>
                  <span className="stat-val font-mono">{report.playerC.points} Pts</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Done</span>
                  <span className="stat-val font-mono">{report.playerC.completionRate}%</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Completed</span>
                  <span className="stat-val font-mono">{report.playerC.completed}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Failed</span>
                  <span className="stat-val font-mono">{report.playerC.failed}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Postponed</span>
                  <span className="stat-val font-mono">{report.playerC.postponed}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="report-player-card empty-card sketch-border-subtle font-mono">
              <div className="lock-icon-wrapper sketch-border-subtle">
                <Lock size={14} />
              </div>
              <h4>No Opponent 2</h4>
            </div>
          )}

        </div>

        {/* Action Button to unlock and start today */}
        <button 
          className="btn-primary start-today-btn" 
          onClick={startNewBattleDay}
        >
          Start Today's Battle
        </button>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 4. ACCEPT CHALLENGE MODAL
// ----------------------------------------------------
export function AcceptChallengeModal({ challenge, onAccept, onReject }) {
  if (!challenge) return null;

  return (
    <div className="modal-overlay">
      <div className="sketch-border modal-card animate-fade-in small-modal" style={{ maxWidth: '420px', zIndex: 1100 }}>
        <div className="modal-header">
          <h3>⚔️ Challenge Received!</h3>
        </div>

        <div className="modal-body" style={{ padding: '20px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ fontSize: '15px' }}>
            <strong>{challenge.from}</strong> has challenged you to a Todo Battle today!
          </p>
          <p className="font-mono text-muted" style={{ fontSize: '12px' }}>
            Lobby Invite Code: <strong>{challenge.battleCode}</strong>
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '8px' }}>
            <button 
              className="btn-primary" 
              onClick={() => onAccept(challenge.id)}
              style={{ padding: '10px' }}
            >
              ✓ Accept
            </button>
            <button 
              className="btn-secondary" 
              onClick={() => onReject(challenge.id)}
              style={{ padding: '10px', borderColor: '#ef4444', color: '#ef4444' }}
            >
              ✗ Decline
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
