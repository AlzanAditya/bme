import React from 'react';
import { useAppState } from '../context/StateContext';
import { TabMode } from '../types';
import { Icon } from './Icon';

interface SidebarProps {
  onOpenSettings: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenSettings }) => {
  const {
    activeTab,
    navigateToMode,
    sidebarCollapsed,
    toggleSidebarCollapsed,
    isLoggedIn,
    adminProfile,
  } = useAppState();

  const currentMode = activeTab?.mode || 'dashboard';

  const navItems: { mode: TabMode; label: string; icon: string }[] = [
    { mode: 'dashboard', label: 'Dashboard', icon: 'grid' },
    { mode: 'manual', label: 'Manual Mode', icon: 'edit-02' },
    { mode: 'ai', label: 'AI Mode', icon: 'cpu-charge' },
    { mode: 'finance', label: 'Keuangan', icon: 'wallet' },
    { mode: 'history', label: 'Histori', icon: 'clock' },
  ];

  return (
    <aside className={`desktop-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <div className="sidebar-logo-wrap">
            <img src="/assets/icons/logo-bme.png" alt="Logo BME" className="sidebar-logo" />
          </div>
          <div className="sidebar-brand-text">
            <h2>BERKAH MAJU ELEKTRIK</h2>
            <p>Invoice & Surat Jalan</p>
          </div>
        </div>
        <button
          id="btn-sidebar-toggle"
          className="sidebar-toggle-btn"
          title="Sembunyikan / Tampilkan Sidebar"
          onClick={toggleSidebarCollapsed}
        >
          <Icon name={sidebarCollapsed ? 'flex-align-right' : 'flex-align-left'} size={18} />
        </button>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const isActive = currentMode === item.mode;
          return (
            <button
              key={item.mode}
              className={`sidebar-item ${isActive ? 'active' : ''}`}
              data-tab={item.mode}
              onClick={() => navigateToMode(item.mode)}
            >
              <Icon name={item.icon} size={20} />
              <span className="sidebar-item-label">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button
          id="btn-sidebar-settings"
          className="sidebar-item"
          onClick={onOpenSettings}
        >
          <Icon name="settings-01" size={20} />
          <span className="sidebar-item-label">Pengaturan</span>
        </button>

        <div className="sidebar-profile">
          {isLoggedIn ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
              {adminProfile?.avatar_url ? (
                <img
                  src={adminProfile.avatar_url}
                  alt="Avatar"
                  style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <Icon name="user-01" size={20} />
              )}
              <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <span className="sidebar-profile-name" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                  {adminProfile?.full_name || 'Administrator'}
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {adminProfile?.email || 'admin@flowa.id'}
                </span>
              </div>
            </div>
          ) : (
            <>
              <Icon name="user-01" size={20} />
              <span className="sidebar-profile-name">Berkah Maju Elektrik</span>
            </>
          )}
        </div>
      </div>
    </aside>
  );
};
