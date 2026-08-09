import React, { useState, useRef } from 'react';
import { useAppState } from '../context/StateContext';
import { HistoryDoc } from '../types';
import { Icon } from './Icon';

interface HistoryViewProps {
  onOpenPreviewDoc: (doc: HistoryDoc, type: 'invoice' | 'surat') => void;
  onShowAlert: (msg: string) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  onOpenPreviewDoc,
  onShowAlert,
}) => {
  const {
    activeTab,
    history,
    deleteHistoryItem,
    loadHistoryItemToActiveTab,
    navigateToMode,
    updateHistoryTitle,
  } = useAppState();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isMultiSelect, setIsMultiSelect] = useState(false);
  const [swipedDocId, setSwipedDocId] = useState<string | null>(null);
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [editingTitleValue, setEditingTitleValue] = useState('');

  const touchStartRef = useRef<{ x: number; y: number; docId: string } | null>(null);

  const isHistoryView = activeTab?.mode === 'history';
  if (!isHistoryView) return null;

  const safeHistory = history || [];

  const filteredHistory = safeHistory.filter((doc) => {
    return (
      (doc.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.date || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const getDataAge = (doc: HistoryDoc) => {
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

  const formatPriceNumber = (total: number) => {
    return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(total || 0);
  };

  const handleLoadDoc = (doc: HistoryDoc) => {
    loadHistoryItemToActiveTab(doc);
    onShowAlert(`Dokumen "${doc.title}" dimuat ke Manual Editor.`);
    navigateToMode('manual');
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBatchDelete = () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Hapus ${selectedIds.length} item histori terpilih?`)) {
      selectedIds.forEach((id) => deleteHistoryItem(id));
      setSelectedIds([]);
      setIsMultiSelect(false);
      onShowAlert('Histori terpilih berhasil dihapus.');
    }
  };

  const shownAgeLabels = new Set<string>();

  return (
    <section id="history-view" className="view active">
      <div id="history-sticky-wrapper">
        <div className="history-toolbar">
          <div className="history-search-wrapper">
            <Icon
              name="search-lg"
              size={14}
              style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              id="history-search"
              className="form-input search-history"
              placeholder="Cari riwayat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '36px', fontSize: '0.9rem' }}
            />
          </div>
          <button
            id="btn-multi-select"
            className={`icon-btn ${isMultiSelect ? 'active' : ''}`}
            title="Pilih Semua / Beberapa"
            style={isMultiSelect ? { color: '#F5A623' } : {}}
            onClick={() => {
              setIsMultiSelect(!isMultiSelect);
              setSelectedIds([]);
              setSwipedDocId(null);
            }}
          >
            <Icon name="check-done-01" size={17} />
          </button>
          <button id="btn-history-filter" className="icon-btn" title="Filter Riwayat">
            <Icon name="filter-funnel-01" size={16} />
          </button>
          <div id="sync-status-indicator" className="sync-status-pill realtime" title="Status Sinkronisasi">
            <div className="sync-status-dot"></div>
            <span className="sync-status-text">Realtime</span>
          </div>
        </div>
      </div>

      <div id="history-list" className="history-list">
        {filteredHistory.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Tidak ditemukan.
          </div>
        ) : (
          filteredHistory.map((doc, idx) => {
            const age = getDataAge(doc);
            const badgeLabel = (age.label && !shownAgeLabels.has(age.label)) ? age.label : '';
            if (age.label) shownAgeLabels.add(age.label);

            const isChecked = selectedIds.includes(doc.id);
            const isSwiped = swipedDocId === doc.id;

            return (
              <div
                key={doc.id}
                className="item-swipe-container"
                style={{
                  position: 'relative',
                  overflow: 'hidden',
                  marginBottom: 0,
                  borderTop: idx === 0 ? '1px solid var(--border-color)' : undefined,
                }}
              >
                {/* Swipe Action Buttons Behind */}
                <div
                  className="swipe-actions"
                  style={{
                    position: 'absolute',
                    top: '1px',
                    bottom: 0,
                    right: 0,
                    display: 'flex',
                    zIndex: 1,
                  }}
                >
                  <button
                    className="swipe-btn swipe-edit-history"
                    title="Edit di Manual Editor"
                    style={{
                      backgroundColor: '#F5A623',
                      border: 'none',
                      color: 'white',
                      padding: '0 20px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLoadDoc(doc);
                    }}
                  >
                    <Icon name="pencil-01" size={16} />
                  </button>
                  <button
                    className="swipe-btn swipe-delete-history"
                    title="Hapus Riwayat"
                    style={{
                      backgroundColor: '#ff4d4f',
                      border: 'none',
                      color: 'white',
                      padding: '0 20px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Hapus "${doc.title}" dari histori?`)) {
                        deleteHistoryItem(doc.id);
                        onShowAlert('Histori telah dihapus.');
                      }
                    }}
                  >
                    <Icon name="trash-01" size={16} />
                  </button>
                </div>

                {/* History Item Foreground Card */}
                <div
                  className={`history-item ${isSwiped ? 'swiped-left' : ''}`}
                  data-index={idx}
                  style={{
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    position: 'relative',
                    zIndex: 2,
                    background: 'var(--bg-card)',
                  }}
                  onTouchStart={(e) => {
                    if (isMultiSelect) return;
                    touchStartRef.current = {
                      x: e.touches[0].clientX,
                      y: e.touches[0].clientY,
                      docId: doc.id,
                    };
                  }}
                  onTouchEnd={(e) => {
                    if (!touchStartRef.current || touchStartRef.current.docId !== doc.id) return;
                    const diffX = e.changedTouches[0].clientX - touchStartRef.current.x;
                    touchStartRef.current = null;
                    if (diffX < -50) {
                      setSwipedDocId(doc.id);
                    } else if (diffX > 50) {
                      setSwipedDocId(null);
                    }
                  }}
                  onClick={() => {
                    if (isMultiSelect) {
                      toggleSelect(doc.id);
                    } else if (isSwiped) {
                      setSwipedDocId(null);
                    } else {
                      onOpenPreviewDoc(doc, 'invoice');
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                    {isMultiSelect && (
                      <label
                        className="history-checkbox-custom"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          className="history-checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelect(doc.id)}
                        />
                        <span className="checkmark"></span>
                      </label>
                    )}

                    <div
                      className="history-content-wrapper"
                      style={{
                        flex: 1,
                        minWidth: 0,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <div
                        className="history-left-group"
                        style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}
                      >
                        {editingTitleId === doc.id ? (
                          <input
                            type="text"
                            className="form-input"
                            value={editingTitleValue}
                            autoFocus
                            onChange={(e) => setEditingTitleValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                if (editingTitleValue.trim()) {
                                  updateHistoryTitle?.(doc.id, editingTitleValue.trim());
                                }
                                setEditingTitleId(null);
                              } else if (e.key === 'Escape') {
                                setEditingTitleId(null);
                              }
                            }}
                            onBlur={() => {
                              if (editingTitleValue.trim()) {
                                updateHistoryTitle?.(doc.id, editingTitleValue.trim());
                              }
                              setEditingTitleId(null);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              height: 'auto',
                              padding: '2px 6px',
                              fontSize: '0.95rem',
                              fontWeight: 600,
                              borderColor: 'var(--primary)',
                            }}
                          />
                        ) : (
                          <h4
                            className="history-title-text"
                            onDoubleClick={(e) => {
                              e.stopPropagation();
                              setEditingTitleId(doc.id);
                              setEditingTitleValue(doc.title || '');
                            }}
                            style={{
                              margin: 0,
                              fontSize: '0.95rem',
                              fontWeight: 600,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {doc.title || 'Tanpa Judul'}
                          </h4>
                        )}
                        <span
                          className="history-info-text"
                          style={{
                            fontSize: '0.78rem',
                            color: 'var(--text-muted)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {doc.date} | {doc.itemsCount || doc.items?.length || 0} Item
                        </span>
                      </div>

                      <div
                        className="history-right-group"
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0 }}
                      >
                        <span className={`age-badge ${age.cls}`}>{badgeLabel}</span>
                        <span
                          className="history-price-text"
                          style={{
                            fontWeight: 700,
                            color: 'var(--primary)',
                            fontSize: '0.92rem',
                            whiteSpace: 'nowrap',
                            lineHeight: 1,
                          }}
                        >
                          <sup
                            style={{
                              fontSize: '0.6em',
                              fontWeight: 500,
                              verticalAlign: 'super',
                              letterSpacing: 0,
                              opacity: 0.75,
                            }}
                          >
                            Rp
                          </sup>
                          {formatPriceNumber(doc.totalAmount)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Batch Action Bar */}
      {isMultiSelect && selectedIds.length > 0 && (
        <div id="batch-delete-bar" className="batch-delete-bar">
          <span id="batch-count" style={{ fontSize: '0.9rem', fontWeight: 600 }}>
            {selectedIds.length} item terpilih
          </span>
          <button
            id="btn-batch-delete"
            className="btn btn-sm"
            style={{ background: '#ff4d4f', color: 'white', border: 'none' }}
            onClick={handleBatchDelete}
          >
            <Icon name="trash-02" size={14} /> Hapus Terpilih
          </button>
        </div>
      )}
    </section>
  );
};

