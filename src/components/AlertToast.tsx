import React, { useEffect } from 'react';
import { Icon } from './Icon';

interface AlertToastProps {
  message: string | null;
  onClose: () => void;
  duration?: number;
}

export const AlertToast: React.FC<AlertToastProps> = ({ message, onClose, duration = 3000 }) => {
  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const msgLower = message.toLowerCase();
  const isError = msgLower.includes('gagal') || msgLower.includes('salah') || msgLower.includes('error');
  const isWarning = msgLower.includes('dihapus') || msgLower.includes('reset') || msgLower.includes('peringatan');

  const iconName = isError ? 'alert-circle' : isWarning ? 'alert-triangle' : 'check-circle';
  const iconColor = isError ? '#e74c3c' : isWarning ? '#e67e22' : '#27ae60';
  const iconBg = isError ? 'rgba(231, 76, 60, 0.12)' : isWarning ? 'rgba(230, 126, 34, 0.12)' : 'rgba(39, 174, 96, 0.12)';

  return (
    <div
      id="custom-alert"
      className="custom-alert"
      style={{
        position: 'fixed',
        top: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10000,
        backgroundColor: 'var(--bg-card, #ffffff)',
        color: 'var(--text-main, #1e293b)',
        padding: '12px 18px',
        borderRadius: '12px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.08)',
        border: '1px solid var(--border-color, #e2e8f0)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        minWidth: '280px',
        maxWidth: '90vw',
        animation: 'alert-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          backgroundColor: iconBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: iconColor,
          flexShrink: 0,
        }}
      >
        <Icon name={iconName} size={18} />
      </div>
      <div
        className="alert-content"
        style={{
          fontSize: '0.9rem',
          fontWeight: 600,
          color: 'var(--text-main, #1e293b)',
          flex: 1,
          lineHeight: '1.4',
        }}
        dangerouslySetInnerHTML={{ __html: message }}
      />
      <button
        type="button"
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-muted, #94a3b8)',
          cursor: 'pointer',
          padding: '4px',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginLeft: '4px',
          flexShrink: 0,
        }}
        aria-label="Tutup"
      >
        <Icon name="x" size={16} />
      </button>
    </div>
  );
};

