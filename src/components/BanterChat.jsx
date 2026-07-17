import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useBattle } from '../context/BattleContext';
import { MessageSquare, Send } from 'lucide-react';

export default function BanterChat() {
  const { currentUser } = useAuth();
  const { activeBattle, sendBanter } = useBattle();
  const [msg, setMsg] = useState('');
  const chatEndRef = useRef(null);

  if (!activeBattle) return null;

  const chatMessages = activeBattle.chat || [];

  // Scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!msg.trim()) return;
    sendBanter(msg.trim());
    setMsg('');
  };

  const handleQuickReaction = (text) => {
    sendBanter(text);
  };

  const quickReactions = [
    '🔥 Zooming ahead!',
    '⏰ Slacking?',
    '✍️ Done for today!',
    '🏆 Good luck!',
    '💪 Productivity streak!',
    '🧘 Taking a break...'
  ];

  return (
    <div className="sketch-border banter-container animate-fade-in">
      <div className="banter-header">
        <h2>💬 Match Banter</h2>
        <p className="banter-subtitle">Send encouragement or call out your opponent's delays!</p>
      </div>

      {/* Messages Scroll Panel */}
      <div className="banter-scroller">
        {chatMessages.length === 0 ? (
          <div className="banter-empty font-mono">
            <span>No messages yet. Send a reaction below!</span>
          </div>
        ) : (
          <div className="messages-list">
            {chatMessages.map((m) => {
              const isMe = m.sender === currentUser?.username;
              return (
                <div key={m.id} className={`message-bubble-wrapper ${isMe ? 'msg-me' : 'msg-them'}`}>
                  <span className="msg-sender font-mono">{m.sender}</span>
                  <div className="msg-bubble sketch-border-subtle">
                    <p className="msg-text">{m.text}</p>
                    <span className="msg-time font-mono">{m.timestamp}</span>
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>
        )}
      </div>

      {/* Quick reaction pills */}
      <div className="quick-reactions-bar">
        {quickReactions.map((r, i) => (
          <button 
            key={i} 
            onClick={() => handleQuickReaction(r)}
            className="quick-pill-btn"
          >
            {r}
          </button>
        ))}
      </div>

      {/* Message input form */}
      <form onSubmit={handleSubmit} className="banter-input-form">
        <input 
          type="text" 
          placeholder="Type your banter..." 
          value={msg}
          onChange={e => setMsg(e.target.value)}
          className="banter-textbox"
          required
        />
        <button type="submit" className="banter-send-btn" title="Send message">
          <Send size={16} />
        </button>
      </form>

      <style>{`
        .banter-container {
          background: var(--surface-color);
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          box-shadow: var(--shadow-sm);
          height: 480px;
          margin-bottom: 24px;
          min-width: 0;
        }

        .banter-header {
          border-bottom: 2px solid var(--border-color);
          padding-bottom: 8px;
        }

        .banter-subtitle {
          font-size: 13px;
          color: var(--text-muted);
        }

        .banter-scroller {
          flex-grow: 1;
          border: 2px solid var(--border-color);
          border-radius: 6px;
          padding: 12px;
          overflow-y: auto;
          background: var(--surface-color);
          box-shadow: inset 1px 1px 4px rgba(0,0,0,0.1);
        }

        .banter-empty {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          font-size: 11px;
          text-align: center;
        }

        .messages-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .message-bubble-wrapper {
          display: flex;
          flex-direction: column;
          max-width: 80%;
        }

        .msg-me {
          align-self: flex-end;
          align-items: flex-end;
        }

        .msg-them {
          align-self: flex-start;
          align-items: flex-start;
        }

        .msg-sender {
          font-size: 10px;
          font-weight: 700;
          margin-bottom: 2px;
          color: var(--text-muted);
        }

        .msg-bubble {
          padding: 8px 12px;
          background: var(--surface-color);
          box-shadow: 2px 2px 0px var(--border-color);
          position: relative;
        }

        .msg-me .msg-bubble {
          background: #f3f4f6; /* slightly tinted for self */
        }

        .msg-text {
          font-size: 14px;
          color: var(--text-primary);
          word-break: break-word;
        }

        .msg-time {
          display: block;
          font-size: 9px;
          color: var(--text-muted);
          text-align: right;
          margin-top: 4px;
        }

        .quick-reactions-bar {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .quick-pill-btn {
          border-radius: 99px;
          padding: 4px 10px;
          font-size: 11px;
          box-shadow: 1px 1px 0px var(--border-color);
          background: var(--surface-color);
          cursor: pointer;
        }

        .quick-pill-btn:hover {
          transform: translate(-1px, -1px);
          box-shadow: 2px 2px 0px var(--border-color);
        }

        .banter-input-form {
          display: flex;
          gap: 8px;
          width: 100%;
        }

        .banter-textbox {
          flex-grow: 1;
          font-size: 13px !important;
          padding: 8px 12px !important;
        }

        .banter-send-btn {
          width: 42px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          background: #000;
          color: #fff;
          border-radius: 8px 12px 6px 10px / 6px 10px 8px 12px;
        }

        .banter-send-btn:hover {
          background: #222222;
        }
      `}</style>
    </div>
  );
}
