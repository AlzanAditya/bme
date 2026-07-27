import React from 'react';
import { useAppState } from '../context/StateContext';
import { Icon } from './Icon';

interface HeaderProps {
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings }) => {
  const { activeTab, labelsHidden, toggleLabelsHidden, isLoggedIn, adminProfile } = useAppState();
  const currentMode = activeTab?.mode || 'dashboard';

  const modeNames: Record<string, string> = {
    manual: 'Manual Mode',
    ai: 'AI Mode',
    finance: 'Keuangan',
    history: 'Histori',
  };

  const isDashboard = currentMode === 'dashboard';

  const fullName = adminProfile?.full_name || 'Administrator';
  const firstName = fullName.trim().split(/\s+/)[0] || 'Admin';
  const email = adminProfile?.email || '';
  const avatarUrl = adminProfile?.avatar_url || '';

  return (
    <header className="app-header">
      <div
        className="brand"
        id="header-brand-container"
        style={{ display: isDashboard ? 'flex' : 'none' }}
      >
        <div
          className="logo-container"
          id="header-logo-container"
          style={{
            borderRadius: isLoggedIn && avatarUrl ? '50%' : undefined,
            border: isLoggedIn && avatarUrl ? '1.5px solid var(--primary)' : undefined,
          }}
        >
          {isLoggedIn && avatarUrl ? (
            <img
              id="header-logo-img"
              src={avatarUrl}
              alt="Avatar"
              className="app-logo"
              style={{ borderRadius: '50%', objectFit: 'cover' }}
            />
          ) : isLoggedIn ? (
            <div
              id="header-logo-placeholder"
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                backgroundColor: 'var(--primary)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
              }}
            >
              {firstName.charAt(0).toUpperCase()}
            </div>
          ) : (
            <img
              id="header-logo-img"
              src="/assets/icons/logo-bme.png"
              alt="Logo"
              className="app-logo"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          )}
        </div>
        <div className="brand-text">
          <h1 id="header-welcome-title">
            {isLoggedIn ? `Hai, ${firstName}!` : 'BERKAH MAJU ELEKTRIK'}
          </h1>
          <p id="header-welcome-sub">
            {isLoggedIn ? email : 'Invoice & Surat Jalan'}
          </p>
        </div>
      </div>

      <h1
        id="header-page-title"
        style={{
          display: isDashboard ? 'none' : 'block',
          fontSize: '1.15rem',
          fontWeight: 700,
          color: 'var(--text-main)',
          margin: 0,
          textTransform: 'capitalize',
          textAlign: 'left',
          flex: 1,
        }}
      >
        {modeNames[currentMode] || currentMode}
      </h1>

      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <button
          id="btn-label-toggle"
          className="icon-btn"
          title="Sembunyikan / Tampilkan Label"
          onClick={toggleLabelsHidden}
        >
          {labelsHidden ? (
            <span id="wrap-icon-eye-closed">
              <Icon name="eye-off" size={20} />
            </span>
          ) : (
            <span id="wrap-icon-eye">
              <Icon name="eye" size={20} />
            </span>
          )}
        </button>
        <button id="btn-settings" className="icon-btn" onClick={onOpenSettings}>
          <Icon name="settings-01" size={22} />
        </button>
      </div>
    </header>
  );
};
