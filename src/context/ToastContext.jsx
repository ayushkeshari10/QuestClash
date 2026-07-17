import React, { createContext, useContext, useState, useCallback } from 'react';
import { AlertCircle, CheckCircle2, Info, X, XCircle } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prevToasts) => [...prevToasts, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prevToasts) => prevToasts.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg, dur) => showToast(msg, 'success', dur),
    error: (msg, dur) => showToast(msg, 'error', dur),
    warning: (msg, dur) => showToast(msg, 'warning', dur),
    info: (msg, dur) => showToast(msg, 'info', dur),
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="toast-icon text-success" size={20} />;
      case 'error':
        return <XCircle className="toast-icon text-failed" size={20} />;
      case 'warning':
        return <AlertCircle className="toast-icon text-postponed" size={20} />;
      default:
        return <Info className="toast-icon text-primary" size={20} />;
    }
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast-card toast-${t.type} animate-slide-in`}>
            <div className="toast-content">
              {getIcon(t.type)}
              <span className="toast-message">{t.message}</span>
            </div>
            <button onClick={() => removeToast(t.id)} className="toast-close-btn">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      <style>{`
        .toast-container {
          position: fixed;
          bottom: 24px;
          right: 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          z-index: 9999;
          max-width: 360px;
          width: calc(100vw - 48px);
        }

        .toast-card {
          background: var(--surface-color);
          border: 2.5px solid var(--border-color);
          border-radius: 12px 6px 10px 8px / 6px 10px 8px 12px;
          padding: 14px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          box-shadow: 4px 4px 0px var(--border-color);
          color: var(--text-primary);
          font-family: var(--font-body);
        }

        .toast-content {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .toast-message {
          color: var(--text-primary);
          font-size: 14px;
          font-weight: 700;
          line-height: 1.4;
        }

        .toast-close-btn {
          background: transparent;
          border: none;
          color: var(--text-primary);
          padding: 2px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: none;
        }

        .toast-close-btn:hover {
          color: var(--text-primary);
          background: #f3f4f6;
          transform: scale(1.1);
          box-shadow: none;
        }

        .toast-success {
          border-style: solid !important;
        }
        .toast-error {
          border-style: double !important;
        }
        .toast-warning {
          border-style: dashed !important;
        }
        .toast-info {
          border-style: dotted !important;
        }

        @media (max-width: 640px) {
          .toast-container {
            bottom: 80px; /* shift up to not overlap bottom tab navigation */
            right: 24px;
            left: 24px;
            max-width: none;
          }
        }
      `}</style>
    </ToastContext.Provider>
  );
};
