import React from 'react';
import { useAppState } from '../context/StateContext';
import { Icon } from './Icon';

export const ChromeTabs: React.FC = () => {
  const {
    tabs,
    activeTabId,
    switchTab,
    closeTab,
    createNewTab,
    sidebarCollapsed,
    toggleSidebarCollapsed,
  } = useAppState();

  return (
    <div className="chrome-tabs-bar" id="chrome-tabs-bar">
      <button
        className="sidebar-toggle-btn"
        id="btn-sidebar-toggle"
        title="Kecilkan/Besarkan Sidebar"
        onClick={toggleSidebarCollapsed}
      >
        <Icon name={sidebarCollapsed ? 'flex-align-right' : 'flex-align-left'} size={20} />
      </button>

      <div className="chrome-tabs-list" id="chrome-tabs-list">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          const isDashboard = tab.mode === 'dashboard';

          return (
            <div
              key={tab.id}
              className={`chrome-tab ${isActive ? 'active' : ''} ${tab.mode}`}
              data-id={tab.id}
              onClick={(e) => {
                if ((e.target as HTMLElement).closest('.tab-close')) return;
                switchTab(tab.id);
              }}
            >
              <div className="tab-color-indicator"></div>
              <span className="tab-title">{tab.title || 'Tab Baru'}</span>
              {!isDashboard && (
                <button
                  className="tab-close"
                  data-id={tab.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(tab.id);
                  }}
                >
                  <Icon name="x" size={16} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      <button
        id="btn-add-tab-chrome"
        className="add-tab-btn-chrome"
        title="Buka Tab Manual Baru"
        onClick={() => createNewTab('manual')}
      >
        <Icon name="plus" size={16} />
      </button>
    </div>
  );
};
