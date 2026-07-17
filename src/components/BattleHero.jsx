import React from 'react';
import { useBattle } from '../context/BattleContext';
import { Award, Trophy } from 'lucide-react';

export default function BattleHero() {
  const { activeBattle, countdown } = useBattle();

  if (!activeBattle) return null;

  const { playerA, playerB, playerC, code } = activeBattle;

  // Compile active players
  const participants = [playerA];
  if (playerB) participants.push(playerB);
  if (playerC) participants.push(playerC);

  // Sort to find the leader
  const sortedParticipants = [...participants].sort((x, y) => {
    if (x.points !== y.points) return y.points - x.points;
    return y.completionRate - x.completionRate;
  });

  const getLeaderText = () => {
    if (participants.length === 1) {
      return 'Waiting for opponents to join the Arena...';
    }
    
    const first = sortedParticipants[0];
    const second = sortedParticipants[1];
    
    if (second && first.points === second.points && first.completionRate === second.completionRate) {
      return `Score is tied between leaders!`;
    }
    
    return `Current Leader: 🏆 ${first.username}`;
  };

  const isLeading = (player) => {
    if (!player || participants.length < 2) return false;
    const first = sortedParticipants[0];
    const second = sortedParticipants[1];
    if (second && first.points === second.points && first.completionRate === second.completionRate) {
      return player.username === first.username || player.username === second.username;
    }
    return player.username === first.username;
  };

  return (
    <section className="battle-hero-container">
      <div className="sketch-border battle-hero-card">
        
        {/* Mobile Countdown timer */}
        <div className="mobile-timer sketch-border-subtle">
          <span className="mobile-timer-lbl">ENDS IN</span>
          <span className="mobile-timer-val font-mono">{countdown.hours}:{countdown.minutes}:{countdown.seconds}</span>
        </div>

        {/* 3-Player Matchup Grid */}
        <div className="battle-matchup three-player-matchup">
          {/* Player A Stats */}
          <div className={`player-matchup-column ${isLeading(playerA) ? 'leading' : ''}`}>
            <div className="avatar-wrapper">
              <img src={playerA.avatar} alt={playerA.username} className="matchup-avatar" />
              {isLeading(playerA) && <Trophy className="matchup-trophy" size={14} />}
            </div>
            <div className="matchup-info">
              <h3 className="matchup-name">{playerA.username}</h3>
              <div className="matchup-score-summary font-mono">
                <span className="matchup-pts">{playerA.points} Pts</span>
                <span>•</span>
                <span className="matchup-pct">{playerA.completionRate}% Done</span>
              </div>
            </div>
            <div className="matchup-progress-bg">
              <div 
                className="matchup-progress-fill" 
                style={{ width: `${playerA.completionRate}%` }}
              />
            </div>
          </div>

          {/* VS Divider A-B */}
          <div className="matchup-vs">
            <div className="vs-badge sketch-border-subtle">VS</div>
          </div>

          {/* Player B Stats */}
          {playerB ? (
            <div className={`player-matchup-column ${isLeading(playerB) ? 'leading' : ''}`}>
              <div className="avatar-wrapper">
                <img src={playerB.avatar} alt={playerB.username} className="matchup-avatar" />
                {isLeading(playerB) && <Trophy className="matchup-trophy" size={14} />}
              </div>
              <div className="matchup-info">
                <h3 className="matchup-name">{playerB.username}</h3>
                <div className="matchup-score-summary font-mono">
                  <span className="matchup-pts">{playerB.points} Pts</span>
                  <span>•</span>
                  <span className="matchup-pct">{playerB.completionRate}% Done</span>
                </div>
              </div>
              <div className="matchup-progress-bg">
                <div 
                  className="matchup-progress-fill" 
                  style={{ width: `${playerB.completionRate}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="player-matchup-column waiting-column">
              <div className="waiting-placeholder">
                <div className="waiting-avatar sketch-border-subtle">?</div>
                <div className="matchup-info">
                  <h3 className="matchup-name text-muted">Awaiting Player</h3>
                  <p className="invite-hint">Open Slot</p>
                </div>
              </div>
            </div>
          )}

          {/* VS Divider B-C */}
          <div className="matchup-vs">
            <div className="vs-badge sketch-border-subtle">VS</div>
          </div>

          {/* Player C Stats */}
          {playerC ? (
            <div className={`player-matchup-column ${isLeading(playerC) ? 'leading' : ''}`}>
              <div className="avatar-wrapper">
                <img src={playerC.avatar} alt={playerC.username} className="matchup-avatar" />
                {isLeading(playerC) && <Trophy className="matchup-trophy" size={14} />}
              </div>
              <div className="matchup-info">
                <h3 className="matchup-name">{playerC.username}</h3>
                <div className="matchup-score-summary font-mono">
                  <span className="matchup-pts">{playerC.points} Pts</span>
                  <span>•</span>
                  <span className="matchup-pct">{playerC.completionRate}% Done</span>
                </div>
              </div>
              <div className="matchup-progress-bg">
                <div 
                  className="matchup-progress-fill" 
                  style={{ width: `${playerC.completionRate}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="player-matchup-column waiting-column">
              <div className="waiting-placeholder">
                <div className="waiting-avatar sketch-border-subtle">?</div>
                <div className="matchup-info">
                  <h3 className="matchup-name text-muted">Awaiting Player</h3>
                  <p className="invite-hint">Open Slot</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Leaderboard status banner */}
        <div className="battle-leaderboard-banner sketch-border-subtle">
          <Award size={16} className="leader-icon" />
          <span className="leader-text">{getLeaderText()}</span>
        </div>
      </div>

      <style>{`
        .battle-hero-container {
          margin-bottom: 24px;
        }

        .battle-hero-card {
          padding: 20px;
          background: #ffffff;
          box-shadow: var(--shadow-sm);
        }

        .mobile-timer {
          display: none;
          background: #ffffff;
          padding: 4px 10px;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
          box-shadow: 1px 1px 0px #000;
        }

        .mobile-timer-lbl {
          font-size: 11px;
          font-weight: 700;
          color: var(--text-muted);
        }

        .mobile-timer-val {
          font-size: 13px;
          font-weight: 700;
        }

        .battle-matchup {
          display: grid;
          align-items: center;
          gap: 16px;
          margin-bottom: 16px;
        }

        .battle-matchup.three-player-matchup {
          grid-template-columns: 1fr auto 1fr auto 1fr;
        }

        .player-matchup-column {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .avatar-wrapper {
          position: relative;
          width: 48px;
          height: 48px;
        }

        .matchup-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: 2px solid #000;
          object-fit: cover;
        }

        .leading .matchup-avatar {
          border-width: 3px;
          box-shadow: 3px 3px 0px #000;
        }

        .matchup-trophy {
          position: absolute;
          bottom: -4px;
          right: -4px;
          background: #ffffff;
          color: #000;
          border: 1.5px solid #000;
          border-radius: 50%;
          padding: 1px;
          box-shadow: 1px 1px 0px #000;
        }

        .matchup-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .matchup-name {
          font-size: 15px;
          font-weight: 800;
        }

        .matchup-score-summary {
          font-size: 11px;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .matchup-pts {
          color: #000;
          font-weight: 700;
        }

        .matchup-pct {
          color: var(--text-muted);
        }

        .matchup-progress-bg {
          height: 10px;
          background: #ffffff;
          border: 2px solid #000;
          border-radius: 6px;
          overflow: hidden;
          box-shadow: 1px 1px 0px #000;
        }

        .matchup-progress-fill {
          height: 100%;
          background: #000000;
          transition: width 0.4s ease-out;
        }

        .matchup-vs {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .vs-badge {
          font-family: var(--font-header);
          font-size: 11px;
          font-weight: 800;
          padding: 4px 8px;
          border-radius: 6px;
          background: #ffffff;
          box-shadow: 1px 1px 0px #000;
        }

        .waiting-placeholder {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .waiting-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: 2px dashed #000;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 18px;
          color: var(--text-muted);
        }

        .invite-hint {
          font-size: 11px;
          color: var(--text-muted);
          margin-top: 2px;
        }

        .battle-leaderboard-banner {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #ffffff;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 12px;
        }

        .leader-icon {
          color: #000;
        }

        .leader-text {
          font-weight: 700;
        }

        @media (max-width: 768px) {
          .battle-matchup.three-player-matchup {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          .matchup-vs {
            display: none;
          }
          .player-matchup-column {
            border-bottom: 1.5px dashed rgba(0,0,0,0.1);
            padding-bottom: 12px;
          }
          .player-matchup-column:last-child {
            border: none;
            padding: 0;
          }
          .mobile-timer {
            display: flex;
          }
        }
      `}</style>
    </section>
  );
}
