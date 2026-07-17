import React, { useMemo } from 'react';
import { useBattle } from '../context/BattleContext';
import { Trophy, Medal, Target } from 'lucide-react';

export default function Leaderboard() {
  const { historyList } = useBattle();

  const stats = useMemo(() => {
    const playerStats = {};

    historyList.forEach(match => {
      // Initialize winner if not exists
      if (match.winner && match.winner !== 'Draw') {
        if (!playerStats[match.winner]) {
          playerStats[match.winner] = { wins: 0, totalMatches: 0, points: 0 };
        }
        playerStats[match.winner].wins += 1;
      }

      // Aggregate matches and points from battle_data
      ['playerA', 'playerB', 'playerC'].forEach(pKey => {
        const p = match[pKey];
        if (p && p.username) {
          if (!playerStats[p.username]) {
            playerStats[p.username] = { wins: 0, totalMatches: 0, points: 0 };
          }
          playerStats[p.username].totalMatches += 1;
          playerStats[p.username].points += p.points || 0;
        }
      });
    });

    const leaderboardArray = Object.entries(playerStats).map(([username, data]) => ({
      username,
      wins: data.wins,
      totalMatches: data.totalMatches,
      points: data.points,
      winRate: data.totalMatches > 0 ? Math.round((data.wins / data.totalMatches) * 100) : 0
    }));

    // Sort by wins, then points
    return leaderboardArray.sort((a, b) => b.wins - a.wins || b.points - a.points);
  }, [historyList]);

  return (
    <div className="leaderboard-wrapper animate-fade-in">
      <div className="sketch-border leaderboard-card">
        <div className="leaderboard-header">
          <Trophy size={28} className="text-primary animate-float" />
          <h2>Global Leaderboard</h2>
        </div>
        
        <div className="leaderboard-list">
          {stats.length === 0 ? (
            <div className="empty-state">No battles completed yet. Be the first to win!</div>
          ) : (
            stats.map((player, index) => (
              <div key={player.username} className="leaderboard-row sketch-border-subtle">
                <div className="rank">
                  {index === 0 && <Medal color="#FFD700" size={24} />}
                  {index === 1 && <Medal color="#C0C0C0" size={24} />}
                  {index === 2 && <Medal color="#CD7F32" size={24} />}
                  {index > 2 && <span className="font-mono">#{index + 1}</span>}
                </div>
                <div className="player-info">
                  <span className="player-name">{player.username}</span>
                  <div className="player-stats-mini">
                    <span><Target size={12} /> {player.points} Total Pts</span>
                  </div>
                </div>
                <div className="player-score">
                  <span className="wins">{player.wins} {player.wins === 1 ? 'Win' : 'Wins'}</span>
                  <span className="win-rate font-mono">{player.winRate}% WR</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <style>{`
        .leaderboard-wrapper {
          max-width: 800px;
          margin: 0 auto;
          padding: 12px 0;
        }
        .leaderboard-card {
          background: var(--surface-color);
          padding: 24px;
          box-shadow: var(--shadow-md);
        }
        .leaderboard-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 2px solid var(--border-color);
        }
        .leaderboard-header h2 {
          font-size: 24px;
          margin: 0;
        }
        .leaderboard-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .leaderboard-row {
          display: flex;
          align-items: center;
          padding: 16px;
          background: #fafafa;
          transition: transform 0.2s;
        }
        .leaderboard-row:hover {
          transform: translateX(4px);
        }
        .rank {
          width: 48px;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 18px;
          font-weight: bold;
        }
        .player-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .player-name {
          font-size: 18px;
          font-weight: bold;
        }
        .player-stats-mini {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: var(--text-muted);
        }
        .player-score {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
        }
        .wins {
          font-size: 18px;
          font-weight: bold;
        }
        .win-rate {
          font-size: 12px;
          color: var(--text-muted);
        }
        .empty-state {
          text-align: center;
          padding: 32px;
          color: var(--text-muted);
          font-style: italic;
        }
        @media (max-width: 768px) {
          .leaderboard-wrapper {
            padding: 12px 16px;
          }
          .leaderboard-card {
            padding: 16px;
          }
          .leaderboard-row {
            padding: 12px;
          }
        }
      `}</style>
    </div>
  );
}
