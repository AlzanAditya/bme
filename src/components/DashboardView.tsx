import React from 'react';
import { useAppState } from '../context/StateContext';
import { Icon } from './Icon';

interface DashboardViewProps {
  onOpenSettings?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onOpenSettings }) => {
  const { activeTab, createNewTab, navigateToMode, history, itemTemplates } = useAppState();

  const isDashboard = activeTab?.mode === 'dashboard';
  if (!isDashboard) return null;

  const safeHistory = history || [];
  const safeItemTemplates = itemTemplates || [];

  const totalHistoryCount = safeHistory.length;
  const totalRevenue = safeHistory.reduce((sum, doc) => sum + (doc.totalAmount || 0), 0);
  const monthlyTarget = 3800000;
  const targetPercent = Math.min(100, Math.round((totalRevenue / monthlyTarget) * 100));

  const formatCurrency = (amount: number) => {
    return 'Rp ' + new Intl.NumberFormat('id-ID').format(amount);
  };

  return (
    <section id="dashboard-view" className="view client-view active">
      {/* Bento Grid for Stats */}
      <div className="dashboard-bento-grid" style={{ marginBottom: '24px' }}>
        {/* Bento Card 1: Keuangan Stats */}
        <div className="dashboard-bento-card glass-panel highlight-purple">
          <div className="card-header-icon">
            <Icon name="bar-line-chart" size={20} />
          </div>
          <div className="stats-label">Total Omset Bisnis</div>
          <div className="stats-value" id="dashboard-total-revenue">
            {formatCurrency(totalRevenue)}
          </div>
          <div className="target-progress-container" style={{ marginTop: '12px', width: '100%' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                marginBottom: '4px',
              }}
            >
              <span>Target Bulanan</span>
              <span id="dashboard-target-percent">{targetPercent}%</span>
            </div>
            <div
              className="dashboard-progress-bar-bg"
              style={{
                width: '100%',
                height: '8px',
                background: 'rgba(255,255,255,0.08)',
                borderRadius: '4px',
                overflow: 'hidden',
              }}
            >
              <div
                id="dashboard-target-progress"
                className="dashboard-progress-bar-fill"
                style={{
                  width: `${targetPercent}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, var(--primary), var(--secondary))',
                  borderRadius: '4px',
                  transition: 'width 0.5s ease',
                }}
              ></div>
            </div>
            <div
              style={{
                textAlign: 'right',
                fontSize: '0.7rem',
                color: 'var(--text-muted)',
                marginTop: '6px',
              }}
              id="dashboard-target-val"
            >
              Target: {formatCurrency(monthlyTarget)}
            </div>
          </div>
        </div>

        {/* Bento Card 2: Dokumen Stats */}
        <div className="dashboard-bento-card glass-panel">
          <div className="card-header-icon">
            <Icon name="file-02" size={20} />
          </div>
          <div
            className="stats-grid"
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', width: '100%' }}
          >
            <div>
              <div className="stats-label" style={{ fontSize: '0.7rem' }}>
                Riwayat
              </div>
              <div className="stats-value" id="dashboard-total-history" style={{ fontSize: '1.6rem' }}>
                {totalHistoryCount}
              </div>
            </div>
            <div>
              <div className="stats-label" style={{ fontSize: '0.7rem' }}>
                Template
              </div>
              <div className="stats-value" id="dashboard-total-templates" style={{ fontSize: '1.6rem' }}>
                {safeItemTemplates.length}
              </div>
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              marginTop: '14px',
            }}
          >
            <Icon name="check-circle" size={14} style={{ color: 'var(--finance-green)' }} />
            <span id="dashboard-active-tab-desc">Semua tab berjalan normal.</span>
          </div>
        </div>
      </div>

      {/* Shortcut Menu Section */}
      <h3
        className="dashboard-section-title"
        style={{
          marginTop: '8px',
          marginBottom: '12px',
          fontSize: '0.85rem',
          fontWeight: 600,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}
      >
        Aksi Cepat &amp; Pintar
      </h3>
      <div className="dashboard-shortcuts-container">
        {/* Shortcut Manual */}
        <button
          className="shortcut-item glass-panel hover-glow"
          data-shortcut="manual"
          style={{ marginBottom: '8px', width: '100%', textAlign: 'left' }}
          onClick={() => createNewTab('manual')}
        >
          <div
            className="shortcut-icon"
            style={{
              background: 'linear-gradient(135deg, rgba(74,144,226,0.15), rgba(74,144,226,0.05))',
              borderColor: 'rgba(74,144,226,0.25)',
            }}
          >
            <Icon name="file-02" size={20} style={{ color: '#4A90E2' }} />
          </div>
          <div className="shortcut-text">
            <h4>Generator Manual</h4>
            <p>Buat invoice &amp; surat jalan secara konvensional langkah demi langkah.</p>
          </div>
          <Icon name="chevron-right" size={16} className="arrow-icon" />
        </button>

        {/* Shortcut AI */}
        <button
          className="shortcut-item glass-panel hover-glow"
          data-shortcut="ai"
          style={{
            border: '1px solid rgba(155, 81, 224, 0.25)',
            marginBottom: '8px',
            width: '100%',
            textAlign: 'left',
          }}
          onClick={() => createNewTab('ai')}
        >
          <div
            className="shortcut-icon"
            style={{
              background: 'linear-gradient(135deg, rgba(155,81,224,0.15), rgba(155,81,224,0.05))',
              borderColor: 'rgba(155,81,224,0.25)',
            }}
          >
            <Icon name="star-04" size={20} style={{ color: '#9B51E0' }} />
          </div>
          <div className="shortcut-text">
            <h4>Ekstraktor Pintar AI</h4>
            <p>Salin teks mentah/faktur, biarkan kecerdasan buatan menyusun data Anda otomatis.</p>
          </div>
          <Icon name="chevron-right" size={16} className="arrow-icon" />
        </button>

        {/* Shortcut Finance */}
        <button
          className="shortcut-item glass-panel hover-glow"
          data-shortcut="finance"
          style={{ marginBottom: '8px', width: '100%', textAlign: 'left' }}
          onClick={() => navigateToMode('finance')}
        >
          <div
            className="shortcut-icon"
            style={{
              background: 'linear-gradient(135deg, rgba(39,174,96,0.15), rgba(39,174,96,0.05))',
              borderColor: 'rgba(39,174,96,0.25)',
            }}
          >
            <Icon name="bar-line-chart" size={20} style={{ color: '#27ae60' }} />
          </div>
          <div className="shortcut-text">
            <h4>Laporan Keuangan</h4>
            <p>Analisis tren pendapatan, monitoring target bulanan, dan evaluasi grafik omset.</p>
          </div>
          <Icon name="chevron-right" size={16} className="arrow-icon" />
        </button>

        {/* Shortcut History */}
        <button
          className="shortcut-item glass-panel hover-glow"
          data-shortcut="history"
          style={{ marginBottom: '8px', width: '100%', textAlign: 'left' }}
          onClick={() => navigateToMode('history')}
        >
          <div
            className="shortcut-icon"
            style={{
              background: 'linear-gradient(135deg, rgba(230,126,34,0.15), rgba(230,126,34,0.05))',
              borderColor: 'rgba(230,126,34,0.25)',
            }}
          >
            <Icon name="hourglass-02" size={20} style={{ color: '#e67e22' }} />
          </div>
          <div className="shortcut-text">
            <h4>Pencarian Riwayat</h4>
            <p>Cari, cetak ulang, ekspor, atau edit kembali invoice &amp; surat jalan terdahulu.</p>
          </div>
          <Icon name="chevron-right" size={16} className="arrow-icon" />
        </button>

        {/* Shortcut Settings */}
        <button
          className="shortcut-item glass-panel hover-glow"
          data-shortcut="settings"
          style={{ width: '100%', textAlign: 'left' }}
          onClick={onOpenSettings}
        >
          <div
            className="shortcut-icon"
            style={{
              background: 'rgba(255,255,255,0.03)',
              borderColor: 'rgba(255,255,255,0.05)',
            }}
          >
            <Icon name="settings-01" size={20} style={{ color: 'var(--text-muted)' }} />
          </div>
          <div className="shortcut-text">
            <h4>Pengaturan Sistem</h4>
            <p>Kelola format nama berkas, ubah bahasa, prompt default AI, dan data administrasi.</p>
          </div>
          <Icon name="chevron-right" size={16} className="arrow-icon" />
        </button>
      </div>
    </section>
  );
};
