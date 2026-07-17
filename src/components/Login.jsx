import React, { useState } from 'react';
import { useAuth, PRESET_AVATARS } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Sword, Lock, User, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const { login, register } = useAuth();
  const { toast } = useToast();
  
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(PRESET_AVATARS[0]);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      if (isRegister) {
        await register(username, password, selectedAvatar);
        toast.success(`Welcome to QuestClash, ${username}!`);
      } else {
        await login(username, password);
        toast.success(`Welcome back, ${username}!`);
      }
    } catch (err) {
      toast.error(err.message || 'An error occurred during authentication');
    }
  };

  return (
    <div className="login-wrapper">
      <div className="sketch-border login-card animate-fade-in">
        
        {/* Brand Banner */}
        <div className="login-brand">
          <div className="brand-logo-ring sketch-border-subtle">
            <Sword className="brand-logo-icon text-primary animate-float" size={28} />
          </div>
          <h2>QuestClash</h2>
          <p className="brand-slogan">Slay your tasks, beat your friends.</p>
        </div>

        {/* Tab Controls */}
        <div className="login-tabs sketch-border-subtle">
          <button 
            type="button" 
            className={`login-tab-btn ${!isRegister ? 'active' : ''}`}
            onClick={() => {
              setIsRegister(false);
              setUsername('');
              setPassword('');
            }}
          >
            Sign In
          </button>
          <button 
            type="button" 
            className={`login-tab-btn ${isRegister ? 'active' : ''}`}
            onClick={() => {
              setIsRegister(true);
              setUsername('');
              setPassword('');
            }}
          >
            Create Account
          </button>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="auth-form-body">
          <div className="form-group">
            <label htmlFor="auth-username">Username</label>
            <div className="input-icon-wrapper">
              <User size={14} className="input-icon text-dark" />
              <input 
                type="text" 
                id="auth-username" 
                placeholder="e.g. Ayush" 
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
              />
            </div>

          </div>

          <div className="form-group">
            <label htmlFor="auth-password">Password</label>
            <div className="input-icon-wrapper">
              <Lock size={14} className="input-icon text-dark" />
              <input 
                type={showPassword ? "text" : "password"} 
                id="auth-password" 
                placeholder="••••••••" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button 
                type="button" 
                className="pwd-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* Register Avatar Picker */}
          {isRegister && (
            <div className="form-group">
              <label>Select Avatar</label>
              <div className="avatar-picker-grid">
                {PRESET_AVATARS.map((avUrl, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`avatar-choice-btn ${selectedAvatar === avUrl ? 'selected' : ''}`}
                    onClick={() => setSelectedAvatar(avUrl)}
                  >
                    <img src={avUrl} alt={`Avatar option ${index + 1}`} className="picker-avatar" />
                  </button>
                ))}
              </div>
            </div>
          )}

          <button type="submit" className="btn-primary auth-submit-btn">
            {isRegister ? 'Register & Start' : 'Sign In'}
          </button>
        </form>
      </div>

      <style>{`
        .login-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: calc(100vh - 120px);
          padding: 24px;
        }

        .login-card {
          width: 100%;
          max-width: 440px;
          padding: 32px;
          background: var(--surface-color);
          box-shadow: var(--shadow-md);
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .login-brand {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 8px;
        }

        .brand-logo-ring {
          width: 60px;
          height: 60px;
          background: var(--surface-color);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: var(--shadow-sm);
          margin-bottom: 4px;
        }

        .login-brand h2 {
          font-size: 26px;
        }

        .brand-slogan {
          color: var(--text-muted);
          font-size: 13px;
        }

        .login-tabs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4px;
          background: var(--surface-color);
          padding: 4px;
          box-shadow: 1px 1px 0px var(--border-color);
        }

        .login-tab-btn {
          padding: 8px;
          font-size: 13px;
          border: none;
          box-shadow: none;
          border-radius: 6px;
          font-family: var(--font-header);
        }

        .login-tab-btn.active {
          background: var(--text-primary);
          color: var(--bg-color);
        }

        .auth-form-body {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .input-icon-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 12px;
        }

        .input-icon-wrapper input {
          width: 100%;
          padding: 10px 12px 10px 34px !important;
        }

        .pwd-toggle-btn {
          position: absolute;
          right: 12px;
          background: transparent;
          border: none;
          box-shadow: none;
          padding: 0;
        }

        .pwd-toggle-btn:hover {
          background: transparent;
          transform: none;
          box-shadow: none;
        }

        .form-hint {
          font-size: 11px;
          color: var(--text-muted);
          margin-top: 2px;
        }

        .avatar-picker-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 6px;
          margin-top: 4px;
        }

        .avatar-choice-btn {
          background: transparent;
          padding: 2px;
          border-radius: 50%;
          border: 2px solid transparent;
          box-shadow: none;
          width: 100%;
          aspect-ratio: 1/1;
        }

        .avatar-choice-btn:hover {
          transform: none;
          background: transparent;
          box-shadow: none;
        }

        .avatar-choice-btn.selected {
          border-color: var(--text-primary);
          transform: scale(1.1);
        }

        .picker-avatar {
          width: 100%;
          height: auto;
          border-radius: 50%;
          object-fit: cover;
          aspect-ratio: 1/1;
          border: 1px solid var(--border-color);
        }

        .auth-submit-btn {
          width: 100%;
          padding: 10px;
          font-size: 14px;
          margin-top: 8px;
        }
      `}</style>
    </div>
  );
}
