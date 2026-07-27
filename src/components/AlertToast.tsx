import React, { useEffect } from 'react';

interface AlertToastProps {
  message: string | null;
  onClose: () => void;
  duration?: number;
}

export const AlertToast: React.FC<AlertToastProps> = ({ message, onClose, duration = 2000 }) => {
  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div
      id="custom-alert"
      className="custom-alert"
      style={{
        position: 'fixed',
        bottom: '80px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        background: 'rgba(0, 0, 0, 0.85)',
        color: '#fff',
        padding: '10px 20px',
        borderRadius: '50px',
        fontSize: '0.9rem',
        fontWeight: 500,
        boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        backdropFilter: 'blur(8px)',
      }}
    >
      <span dangerouslySetInnerHTML={{ __html: message }} />
    </div>
  );
};
