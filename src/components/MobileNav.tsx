import React, { useState } from 'react';
import { useAppState } from '../context/StateContext';
import { Icon } from './Icon';
import { AIRadialOverlay } from './AIRadialOverlay';

interface MobileNavProps {
  onShowAlert?: (msg: string) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ onShowAlert }) => {
  const { activeTab, navigateToMode } = useAppState();
  const currentMode = activeTab?.mode || 'dashboard';
  const [isRadialOpen, setIsRadialOpen] = useState(false);

  const handleAiClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigateToMode('ai');
    setIsRadialOpen((prev) => !prev);
  };

  return (
    <>
      <AIRadialOverlay
        isOpen={isRadialOpen}
        onClose={() => setIsRadialOpen(false)}
        onShowAlert={onShowAlert}
      />
      <nav className="tab-nav">
        <button
          className={`tab-btn ${currentMode === 'dashboard' ? 'active' : ''}`}
          data-tab="dashboard"
          onClick={() => navigateToMode('dashboard')}
        >
          <Icon name="home-line" size={20} />
          <span>Beranda</span>
        </button>

        <button
          className={`tab-btn ${currentMode === 'manual' ? 'active' : ''}`}
          data-tab="manual"
          onClick={() => navigateToMode('manual')}
        >
          <Icon name="file-02" size={20} />
          <span>Manual</span>
        </button>

        <div className="tab-btn-ai-wrapper">
          <button
            className={`tab-btn tab-btn-ai ${currentMode === 'ai' ? 'active' : ''}`}
            data-tab="ai"
            title="AI Mode"
            onClick={handleAiClick}
          >
            <Icon name="star-04" size={22} />
          </button>
        </div>

        <button
          className={`tab-btn ${currentMode === 'finance' ? 'active' : ''}`}
          data-tab="finance"
          onClick={() => navigateToMode('finance')}
        >
          <Icon name="bar-line-chart" size={20} />
          <span>Keuangan</span>
        </button>

        <button
          className={`tab-btn ${currentMode === 'history' ? 'active' : ''}`}
          data-tab="history"
          onClick={() => navigateToMode('history')}
        >
          <Icon name="hourglass-02" size={20} />
          <span>Histori</span>
        </button>
      </nav>
    </>
  );
};
