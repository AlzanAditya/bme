import React, { useState, useEffect, useRef } from 'react';
import { useAppState } from '../context/StateContext';
import { Icon } from './Icon';

export const WorkspaceHeader: React.FC = () => {
  const {
    activeTab,
    updateActiveTabTitle,
    manualViewMode,
    setManualViewMode,
    manualCardMode,
    setManualCardMode,
    labelsHidden,
    toggleLabelsHidden,
    settings,
    updateSettings,
    toolbarCollapsed,
    toggleToolbarCollapsed,
  } = useAppState();

  const currentMode = activeTab?.mode || 'manual';
  const isManualMode = currentMode === 'manual';

  const [tampilanOpen, setTampilanOpen] = useState(false);
  const [labelOpen, setLabelOpen] = useState(false);
  const [temaOpen, setTemaOpen] = useState(false);

  const toolbarRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        setTampilanOpen(false);
        setLabelOpen(false);
        setTemaOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isManualMode) return null;

  return (
    <div className="workspace-header" ref={toolbarRef}>
      <div className="workspace-title-wrap">
        <div className="workspace-title-label">JUDUL</div>
        <input
          type="text"
          id="manual-title-desktop"
          className="workspace-title-input glass-input"
          placeholder="Contoh: Invoice #001"
          value={activeTab?.title || ''}
          onChange={(e) => updateActiveTabTitle(e.target.value)}
        />
      </div>

      <div className={`workspace-header-toolbar ${toolbarCollapsed ? 'collapsed' : ''}`}>
        <div className="toolbar-group">
          {/* Card View / Table View Segmented */}
          <div className="view-mode-toggle" id="desktop-view-mode-toggle">
            <button
              id="desktop-view-card-btn"
              className={`segmented-btn ${manualViewMode === 'card' ? 'active' : ''}`}
              title="Tampilan Kartu"
              onClick={() => setManualViewMode('card')}
            >
              <Icon name="layout-grid-01" size={16} />
            </button>
            <button
              id="desktop-view-table-btn"
              className={`segmented-btn ${manualViewMode === 'table' ? 'active' : ''}`}
              title="Tampilan Tabel"
              onClick={() => setManualViewMode('table')}
            >
              <Icon name="list" size={16} />
            </button>
          </div>

          {/* Simple / Advance Mode Segmented */}
          <div className="view-mode-toggle" id="desktop-mode-toggle">
            <button
              id="desktop-mode-simple-btn"
              className={`segmented-btn ${manualCardMode === 'simple' ? 'active' : ''}`}
              title="Mode Sederhana"
              onClick={() => setManualCardMode('simple')}
            >
              <Icon name="zap" size={16} />
            </button>
            <button
              id="desktop-mode-advance-btn"
              className={`segmented-btn ${manualCardMode === 'advance' ? 'active' : ''}`}
              title="Mode Lanjutan"
              onClick={() => setManualCardMode('advance')}
            >
              <Icon name="sliders-01" size={16} />
            </button>
          </div>

          {/* Pill Tampilan Dropdown */}
          <div className="pill-dropdown-wrap" id="pill-tampilan">
            <button
              className="pill-trigger"
              onClick={() => {
                setTampilanOpen(!tampilanOpen);
                setLabelOpen(false);
                setTemaOpen(false);
              }}
            >
              <Icon name={manualViewMode === 'table' ? 'list' : 'layout-grid-01'} size={14} />
              <span>{manualViewMode === 'table' ? 'Tabel' : 'Kartu'}</span>
              <Icon name="chevron-down" size={12} />
            </button>

            {tampilanOpen && (
              <div className="pill-dropdown-menu show">
                <button
                  id="opt-view-card"
                  className={`pill-option ${manualViewMode === 'card' ? 'active' : ''}`}
                  onClick={() => {
                    setManualViewMode('card');
                    setTampilanOpen(false);
                  }}
                >
                  <Icon name="layout-grid-01" size={14} />
                  <span>Kartu</span>
                </button>
                <button
                  id="opt-view-table"
                  className={`pill-option ${manualViewMode === 'table' ? 'active' : ''}`}
                  onClick={() => {
                    setManualViewMode('table');
                    setTampilanOpen(false);
                  }}
                >
                  <Icon name="list" size={14} />
                  <span>Tabel</span>
                </button>
              </div>
            )}
          </div>

          {/* Pill Label Dropdown */}
          <div className="pill-dropdown-wrap" id="pill-label">
            <button
              className="pill-trigger"
              onClick={() => {
                setLabelOpen(!labelOpen);
                setTampilanOpen(false);
                setTemaOpen(false);
              }}
            >
              <Icon name={labelsHidden ? 'eye-off' : 'eye'} size={14} />
              <span>{labelsHidden ? 'sederhana' : 'detail'}</span>
              <Icon name="chevron-down" size={12} />
            </button>

            {labelOpen && (
              <div className="pill-dropdown-menu show">
                <button
                  id="opt-label-detail"
                  className={`pill-option ${!labelsHidden ? 'active' : ''}`}
                  onClick={() => {
                    if (labelsHidden) toggleLabelsHidden();
                    setLabelOpen(false);
                  }}
                >
                  <Icon name="eye" size={14} />
                  <span>Detail</span>
                </button>
                <button
                  id="opt-label-sederhana"
                  className={`pill-option ${labelsHidden ? 'active' : ''}`}
                  onClick={() => {
                    if (!labelsHidden) toggleLabelsHidden();
                    setLabelOpen(false);
                  }}
                >
                  <Icon name="eye-off" size={14} />
                  <span>Sederhana</span>
                </button>
              </div>
            )}
          </div>

          {/* Pill Tema Dropdown */}
          <div className="pill-dropdown-wrap" id="pill-tema">
            <button
              className="pill-trigger"
              onClick={() => {
                setTemaOpen(!temaOpen);
                setTampilanOpen(false);
                setLabelOpen(false);
              }}
            >
              <Icon
                name={
                  settings.theme === 'dark'
                    ? 'moon-01'
                    : settings.theme === 'light'
                    ? 'sun'
                    : 'monitor-02'
                }
                size={14}
              />
              <span>
                {settings.theme === 'dark'
                  ? 'Gelap'
                  : settings.theme === 'light'
                  ? 'Terang'
                  : 'Sistem'}
              </span>
              <Icon name="chevron-down" size={12} />
            </button>

            {temaOpen && (
              <div className="pill-dropdown-menu show">
                <button
                  id="opt-theme-light"
                  className={`pill-option ${settings.theme === 'light' ? 'active' : ''}`}
                  onClick={() => {
                    updateSettings({ theme: 'light' });
                    setTemaOpen(false);
                  }}
                >
                  <Icon name="sun" size={14} />
                  <span>Terang</span>
                </button>
                <button
                  id="opt-theme-dark"
                  className={`pill-option ${settings.theme === 'dark' ? 'active' : ''}`}
                  onClick={() => {
                    updateSettings({ theme: 'dark' });
                    setTemaOpen(false);
                  }}
                >
                  <Icon name="moon-01" size={14} />
                  <span>Gelap</span>
                </button>
                <button
                  id="opt-theme-system"
                  className={`pill-option ${settings.theme === 'system' ? 'active' : ''}`}
                  onClick={() => {
                    updateSettings({ theme: 'system' });
                    setTemaOpen(false);
                  }}
                >
                  <Icon name="monitor-02" size={14} />
                  <span>Sistem</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <button
          id="btn-toolbar-toggle"
          className="toolbar-toggle-btn"
          title="Tutup/Buka Toolbar"
          onClick={toggleToolbarCollapsed}
        >
          <Icon name={toolbarCollapsed ? 'chevron-down' : 'chevron-up'} size={16} />
        </button>
      </div>
    </div>
  );
};
