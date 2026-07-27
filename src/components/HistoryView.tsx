import React, { useState } from 'react';
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
  } = useAppState();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isMultiSelect, setIsMultiSelect] = useState(false);

  const isHistoryView = activeTab?.mode === 'history';
  if (!isHistoryView) return null;

  const safeHistory = history || [];

  const filteredHistory = safeHistory.filter((doc) => {
    return (
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.date.includes(searchTerm)
    );
  });

  const formatCurrency = (val: number) => {
    return 'Rp ' + new Intl.NumberFormat('id-ID').format(val || 0);
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
            onClick={() => {
              setIsMultiSelect(!isMultiSelect);
              setSelectedIds([]);
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
          <div
            className="empty-state-card"
            style={{ textAlign: 'center', padding: '40px 20px', borderRadius: '12px' }}
          >
            <Icon name="hourglass-02" size={32} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
            <h4 style={{ margin: '0 0 6px 0', color: 'var(--text-main)' }}>Histori Kosong</h4>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Belum ada invoice tersimpan di histori. Simpan invoice dari Manual Mode untuk melihatnya di sini.
            </p>
          </div>
        ) : (
          filteredHistory.map((doc) => {
            const isSelected = selectedIds.includes(doc.id);
            return (
              <div
                key={doc.id}
                className={`history-card glass-panel ${isSelected ? 'is-selected' : ''}`}
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-card)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '10px',
                  cursor: isMultiSelect ? 'pointer' : 'default',
                }}
                onClick={() => {
                  if (isMultiSelect) toggleSelect(doc.id);
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                  {isMultiSelect && (
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(doc.id)}
                      style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                    />
                  )}
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(74, 144, 226, 0.1)',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon name="file-02" size={20} />
                  </div>

                  <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: 'var(--text-main)' }}>
                      {doc.title || 'Invoice Tanpa Judul'}
                    </h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {doc.date} • {doc.itemsCount} Item • {formatCurrency(doc.totalAmount)}
                    </span>
                  </div>
                </div>

                {!isMultiSelect && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={() => handleLoadDoc(doc)}
                      title="Buka kembali di Manual Editor"
                    >
                      <Icon name="edit-02" size={14} />
                      <span>Edit</span>
                    </button>

                    <button
                      className="btn btn-sm btn-outline"
                      onClick={() => onOpenPreviewDoc(doc, 'invoice')}
                      title="Lihat Pratinjau Document"
                    >
                      <Icon name="eye" size={14} />
                      <span>Preview</span>
                    </button>

                    <button
                      className="icon-btn danger"
                      onClick={() => {
                        if (confirm(`Hapus "${doc.title}" dari histori?`)) {
                          deleteHistoryItem(doc.id);
                          onShowAlert('Histori telah dihapus.');
                        }
                      }}
                      title="Hapus Histori"
                    >
                      <Icon name="trash-01" size={16} />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Batch Action Bar */}
      {isMultiSelect && (
        <div id="batch-delete-bar" className="batch-delete-bar">
          <span id="batch-count">{selectedIds.length} dipilih</span>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              id="btn-batch-delete"
              className="btn btn-sm"
              style={{ background: '#ff4d4f', color: 'white', border: 'none' }}
              onClick={handleBatchDelete}
            >
              <Icon name="trash-02" size={14} /> Hapus
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
