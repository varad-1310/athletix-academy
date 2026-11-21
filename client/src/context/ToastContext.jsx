import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const success = (msg, dur) => addToast(msg, 'success', dur);
  const error = (msg, dur) => addToast(msg, 'error', dur);
  const warning = (msg, dur) => addToast(msg, 'warning', dur);
  const info = (msg, dur) => addToast(msg, 'info', dur);

  return (
    <ToastContext.Provider value={{ addToast, removeToast, success, error, warning, info }}>
      {children}
      {/* Toast container floating at bottom right */}
      <div style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        maxWidth: 400,
        pointerEvents: 'none'
      }}>
        {toasts.map(toast => {
          let Icon = CheckCircle2;
          let iconColor = 'var(--success)';
          let borderColor = 'rgba(34, 164, 119, 0.4)';

          if (toast.type === 'error') {
            Icon = XCircle;
            iconColor = 'var(--danger)';
            borderColor = 'rgba(222, 89, 101, 0.4)';
          } else if (toast.type === 'warning') {
            Icon = AlertTriangle;
            iconColor = 'var(--warning)';
            borderColor = 'rgba(229, 162, 58, 0.4)';
          } else if (toast.type === 'info') {
            Icon = Info;
            iconColor = 'var(--primary-blue)';
            borderColor = 'rgba(77, 131, 215, 0.4)';
          }

          return (
            <div
              key={toast.id}
              className="neu-card"
              style={{
                pointerEvents: 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '14px 18px',
                borderLeft: `4px solid ${iconColor}`,
                boxShadow: 'var(--shadow-raised-lg)',
                backgroundColor: 'var(--card-bg)',
                animation: 'slideIn 0.25s ease-out'
              }}
            >
              <Icon size={20} color={iconColor} style={{ flexShrink: 0 }} />
              <div style={{ flex: 1, fontSize: '0.92rem', color: 'var(--dark-text)', fontWeight: 500 }}>
                {toast.message}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--secondary-text)',
                  padding: 2
                }}
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};
