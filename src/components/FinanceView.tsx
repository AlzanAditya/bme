import React, { useState } from 'react';
import { useAppState } from '../context/StateContext';
import { Icon } from './Icon';

export const FinanceView: React.FC = () => {
  const { activeTab, history } = useAppState();

  const [monthlyTarget, setMonthlyTarget] = useState<number>(3800000);
  const [viewMode, setViewMode] = useState<'bulan' | 'tahun' | 'semua'>('bulan');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [sortOrder, setSortOrder] = useState<'terbaru' | 'terlama'>('terbaru');

  const isFinanceView = activeTab?.mode === 'finance';
  if (!isFinanceView) return null;

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const safeHistory = history || [];

  // Filter history for current month revenue
  const thisMonthIncome = safeHistory
    .filter((doc) => {
      const d = new Date(doc.createdAt || Date.now());
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((sum, doc) => sum + (doc.totalAmount || 0), 0);

  const totalAllIncome = safeHistory.reduce((sum, doc) => sum + (doc.totalAmount || 0), 0);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID').format(val || 0);
  };

  const formattedTargetInput = new Intl.NumberFormat('id-ID').format(monthlyTarget);

  const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

  // Monthly totals for selectedYear
  const monthlyData = MONTH_NAMES.map((name, index) => {
    const total = safeHistory
      .filter((doc) => {
        const d = new Date(doc.createdAt || Date.now());
        return d.getMonth() === index && d.getFullYear() === selectedYear;
      })
      .reduce((sum, doc) => sum + (doc.totalAmount || 0), 0);
    return { name, total };
  });

  const maxVal = Math.max(...monthlyData.map((d) => d.total), monthlyTarget, 1);

  const sortedHistory = [...safeHistory].sort((a, b) => {
    const tA = a.createdAt || 0;
    const tB = b.createdAt || 0;
    return sortOrder === 'terbaru' ? tB - tA : tA - tB;
  });

  const getDataAge = (doc: any) => {
    const timestamp = doc.createdAt || doc.id;
    if (!timestamp) return { label: '', cls: '' };

    let itemDate: Date;
    if (typeof timestamp === 'number') {
      itemDate = new Date(timestamp);
    } else if (!isNaN(Number(timestamp))) {
      itemDate = new Date(Number(timestamp));
    } else {
      itemDate = new Date(timestamp);
    }

    if (isNaN(itemDate.getTime())) return { label: '', cls: '' };

    const now = new Date();
    const nowDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const itemDay = new Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate());
    const diffDays = Math.round((nowDay.getTime() - itemDay.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return { label: 'Hari ini', cls: 'age-today' };
    if (diffDays === 1) return { label: 'Kemarin', cls: 'age-yesterday' };
    if (diffDays <= 7) return { label: `${diffDays} hari lalu`, cls: 'age-week' };
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return { label: weeks === 1 ? 'Minggu lalu' : `${weeks} minggu lalu`, cls: 'age-last-week' };
    }
    if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return { label: months === 1 ? 'Bulan lalu' : `${months} bulan lalu`, cls: 'age-month' };
    }
    const years = Math.floor(diffDays / 365);
    return { label: years === 1 ? 'Tahun lalu' : `${years} tahun lalu`, cls: 'age-year' };
  };

  const shownFinanceAgeLabels = new Set<string>();

  return (
    <section id="finance-view" className="view active">
      {/* Target & Mode Controls — single row */}
      <div className="finance-controls">
        <div className="finance-target-unit">
          <label className="field-label">Target Bulanan</label>
          <div className="finance-target-input-wrap">
            <span className="finance-target-prefix">Rp</span>
            <input
              type="text"
              id="finance-target-input"
              className="finance-target-input"
              placeholder="3.800.000"
              inputMode="numeric"
              value={formattedTargetInput}
              onChange={(e) => {
                const raw = parseInt(e.target.value.replace(/\D/g, '')) || 0;
                setMonthlyTarget(raw);
              }}
            />
          </div>
        </div>
        <div className="segmented-group" id="finance-mode-switcher">
          <button
            className={`segmented-btn ${viewMode === 'bulan' ? 'active' : ''}`}
            onClick={() => setViewMode('bulan')}
          >
            Bulan
          </button>
          <button
            className={`segmented-btn ${viewMode === 'tahun' ? 'active' : ''}`}
            onClick={() => setViewMode('tahun')}
          >
            Tahun
          </button>
          <button
            className={`segmented-btn ${viewMode === 'semua' ? 'active' : ''}`}
            onClick={() => setViewMode('semua')}
          >
            Semua
          </button>
        </div>
      </div>

      {/* Pemasukan Summary Card */}
      <div className="finance-summary-card">
        <p className="finance-summary-label" id="finance-summary-label">
          {viewMode === 'bulan'
            ? 'Pemasukan bulan ini'
            : viewMode === 'tahun'
            ? `Pemasukan tahun ${selectedYear}`
            : 'Total Pemasukan Seluruhnya'}
        </p>
        <div className="finance-summary-amount">
          <span className="finance-rp">Rp.</span>
          <span id="finance-amount-value">
            {formatCurrency(viewMode === 'bulan' ? thisMonthIncome : totalAllIncome)}
          </span>
        </div>
        <p className="finance-summary-sub" id="finance-summary-sub">
          {viewMode === 'bulan' &&
            (thisMonthIncome >= monthlyTarget
              ? '🎉 Target bulanan telah tercapai!'
              : `Kurang Rp ${formatCurrency(monthlyTarget - thisMonthIncome)} lagi untuk capai target.`)}
        </p>
      </div>

      {/* Bar Chart: Bulanan */}
      <div className="finance-chart-card" id="finance-monthly-card">
        <div className="finance-chart-header">
          <span className="finance-chart-title" id="finance-chart-year">
            {selectedYear}
          </span>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              className="finance-nav-btn"
              id="finance-year-prev"
              onClick={() => setSelectedYear(selectedYear - 1)}
            >
              <Icon name="chevron-left" size={16} />
            </button>
            <button
              className="finance-nav-btn"
              id="finance-year-next"
              onClick={() => setSelectedYear(selectedYear + 1)}
            >
              <Icon name="chevron-right" size={16} />
            </button>
          </div>
        </div>
        <div className="finance-chart" id="finance-monthly-chart" style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '160px', paddingTop: '20px' }}>
          {monthlyData.map((d, idx) => {
            const heightPercent = Math.min(100, Math.round((d.total / maxVal) * 100));
            return (
              <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                <div
                  title={`Rp ${formatCurrency(d.total)}`}
                  style={{
                    width: '100%',
                    height: `${Math.max(8, heightPercent)}%`,
                    backgroundColor: idx === currentMonth && selectedYear === currentYear ? 'var(--primary)' : 'rgba(74,144,226,0.3)',
                    borderRadius: '4px 4px 0 0',
                    transition: 'height 0.3s ease',
                  }}
                ></div>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px' }}>{d.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mini History */}
      <div className="finance-history-section">
        <div className="finance-history-header">
          <span className="finance-chart-title">History</span>
          <select
            id="finance-history-sort"
            className="finance-sort-select"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'terbaru' | 'terlama')}
          >
            <option value="terbaru">Terbaru</option>
            <option value="terlama">Terlama</option>
          </select>
        </div>
        <div id="finance-history-list">
          {sortedHistory.length === 0 ? (
            <div style={{ padding: '14px 20px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Tidak ada data
            </div>
          ) : (
            sortedHistory.map((doc) => {
              const age = getDataAge(doc);
              const badgeLabel = (age.label && !shownFinanceAgeLabels.has(age.label)) ? age.label : '';
              if (age.label) shownFinanceAgeLabels.add(age.label);

              return (
                <div key={doc.id} className="history-item" style={{ cursor: 'default' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '3px' }}>
                        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1, minWidth: 0 }}>
                          {doc.title || 'Tanpa Judul'}
                        </h4>
                        <span className={`age-badge ${age.cls}`} style={{ flexShrink: 0 }}>{badgeLabel}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {doc.date || ''} | {doc.itemsCount || doc.items?.length || 0} Item
                        </span>
                        <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.92rem', whiteSpace: 'nowrap', flexShrink: 0, lineHeight: 1 }}>
                          <sup style={{ fontSize: '0.6em', fontWeight: 500, verticalAlign: 'super', letterSpacing: 0, opacity: 0.75 }}>Rp</sup>
                          {formatCurrency(doc.totalAmount)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
};
