import React from 'react';
import { useAppState, DEFAULT_CLIENT_NAME, DEFAULT_SURAT_JALAN_ADDRESS } from '../context/StateContext';
import { InvoiceItem } from '../types';
import { Icon } from './Icon';
import { InlinePreviewSection } from './InlinePreviewSection';

interface ManualViewProps {
  onOpenTemplatePicker: () => void;
  onShowAlert: (msg: string) => void;
  onOpenFullPreview?: (type: 'invoice' | 'surat') => void;
  onDownloadDoc?: (type: 'invoice' | 'surat') => void;
}

const formatNumberStr = (num: number) => {
  if (!num || isNaN(num)) return '';
  return new Intl.NumberFormat('id-ID').format(num);
};

const formatCurrency = (amount: number) => {
  return 'Rp ' + new Intl.NumberFormat('id-ID').format(amount || 0);
};

export const ManualView: React.FC<ManualViewProps> = ({
  onOpenTemplatePicker,
  onShowAlert,
  onOpenFullPreview,
  onDownloadDoc,
}) => {
  const {
    activeTab,
    invoiceItems,
    addInvoiceItem,
    updateInvoiceItem,
    deleteInvoiceItem,
    manualViewMode,
    setManualViewMode,
    manualCardMode,
    setManualCardMode,
    updateActiveTabTitle,
    clientName,
    updateClientName,
    resetClientName,
    docDate,
    updateDocDate,
    showPaymentInfo,
    toggleShowPaymentInfo,
    docHeaderTitle,
    setDocHeaderTitle,
    toggleDocHeaderTitle,
    suratJalanAddress,
    updateSuratJalanAddress,
    resetSuratJalanAddress,
  } = useAppState();

  const isManualView = activeTab?.mode === 'manual';
  if (!isManualView) return null;

  const safeInvoiceItems = invoiceItems || [];

  const handleAddNewBlankItem = () => {
    const newItem: InvoiceItem = {
      id: 'item-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      name: '',
      tipe: '-',
      note: '',
      qty: 1,
      qtyUnit: 'pcs',
      price: 0,
      invKeterangan: '',
      sjKeterangan: '',
    };
    addInvoiceItem(newItem);
  };

  const grandTotal = safeInvoiceItems.reduce(
    (sum, item) => sum + (item.price || 0) * (item.qty || 1),
    0
  );

  return (
    <section id="manual-view" className="view client-view active">
      {/* Document Metadata Grid (Judul, Nama Klien, Tanggal, & Info Pembayaran) */}
      <div
        className="doc-metadata-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '12px',
          marginBottom: '12px',
        }}
      >
        {/* Judul Invoice input */}
        <div className="input-group item-field-wrap" style={{ margin: 0 }}>
          <label className="field-label">Judul Invoice</label>
          <input
            type="text"
            id="manual-title"
            className="form-input title"
            placeholder="Contoh: Invoice #001"
            value={activeTab?.title || ''}
            onChange={(e) => updateActiveTabTitle(e.target.value)}
          />
        </div>

        {/* Nama Klien Penerima input & Reset button */}
        <div className="input-group item-field-wrap" style={{ margin: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <label className="field-label" style={{ margin: 0 }}>Nama Klien Penerima</label>
            {clientName !== DEFAULT_CLIENT_NAME && (
              <span
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  fontStyle: 'italic',
                }}
              >
                Custom
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type="text"
              id="client-name-input"
              className="form-input"
              placeholder="PT. SARASWANTI INDO GENETECH"
              value={clientName}
              onChange={(e) => updateClientName(e.target.value)}
              style={{ flex: 1 }}
            />
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => {
                resetClientName();
                onShowAlert('Nama klien penerima dikembalikan ke default');
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '8px 12px',
                fontSize: '0.8rem',
                whiteSpace: 'nowrap',
                height: '38px',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
              title="Reset nama klien penerima ke default (PT. SARASWANTI INDO GENETECH)"
            >
              <Icon name="rotate-ccw" size={14} />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Tanggal Dokumen input */}
        <div className="input-group item-field-wrap" style={{ margin: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <label className="field-label" style={{ margin: 0 }}>Tanggal Dokumen</label>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {docDate ? 'Terisi' : 'Kosong (Default)'}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type="text"
              id="doc-date-input"
              className="form-input"
              placeholder="Kosong (contoh: 10/08/2026)"
              value={docDate}
              onChange={(e) => updateDocDate(e.target.value)}
              style={{ flex: 1 }}
            />
            {!docDate ? (
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => {
                  const today = new Date().toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  });
                  updateDocDate(today);
                  onShowAlert(`Tanggal diisi: ${today}`);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '8px 10px',
                  fontSize: '0.78rem',
                  whiteSpace: 'nowrap',
                  height: '38px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
                title="Isi dengan tanggal hari ini"
              >
                <Icon name="calendar" size={14} />
                <span>Hari Ini</span>
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => {
                  updateDocDate('');
                  onShowAlert('Tanggal dokumen dikosongkan');
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '8px 10px',
                  fontSize: '0.78rem',
                  whiteSpace: 'nowrap',
                  height: '38px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
                title="Kosongkan tanggal dokumen"
              >
                <Icon name="x" size={14} />
                <span>Hapus</span>
              </button>
            )}
          </div>
        </div>

        {/* Checkbox Toggle Info Pembayaran BCA */}
        <div className="input-group item-field-wrap" style={{ margin: 0 }}>
          <label className="field-label" style={{ marginBottom: '4px' }}>Info Pembayaran Invoice</label>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 12px',
              border: '1px solid var(--border-color, #e2e8f0)',
              borderRadius: '6px',
              height: '38px',
              backgroundColor: 'var(--bg-card, #ffffff)',
              cursor: 'pointer',
              userSelect: 'none',
            }}
            onClick={toggleShowPaymentInfo}
          >
            <input
              type="checkbox"
              id="show-payment-info-checkbox"
              checked={showPaymentInfo}
              onChange={toggleShowPaymentInfo}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '16px',
                height: '16px',
                accentColor: 'var(--primary-color, #e67e22)',
                cursor: 'pointer',
              }}
            />
            <label
              htmlFor="show-payment-info-checkbox"
              style={{
                fontSize: '0.82rem',
                color: 'var(--text-main, #2c3e50)',
                cursor: 'pointer',
                margin: 0,
                fontWeight: 500,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              Munculkan Rekening Bank BCA
            </label>
          </div>
        </div>

        {/* Switch Header Judul (INVOICE / PENAWARAN) - Khusus Invoice */}
        <div className="input-group item-field-wrap" style={{ margin: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <label className="field-label" style={{ margin: 0 }}>Header Dokumen (Khusus Invoice)</label>
            <span
              style={{
                fontSize: '0.75rem',
                color: 'var(--primary-color, #e67e22)',
                fontWeight: 600,
              }}
            >
              {docHeaderTitle}
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              gap: '4px',
              padding: '3px',
              border: '1px solid var(--border-color, #e2e8f0)',
              borderRadius: '6px',
              height: '38px',
              backgroundColor: 'var(--bg-card, #ffffff)',
              alignItems: 'center',
            }}
          >
            <button
              type="button"
              className={`btn btn-sm ${docHeaderTitle === 'INVOICE' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => {
                setDocHeaderTitle('INVOICE');
                onShowAlert('Header dokumen diubah ke INVOICE');
              }}
              style={{
                flex: 1,
                height: '30px',
                padding: '0 8px',
                fontSize: '0.8rem',
                fontWeight: 600,
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              INVOICE
            </button>
            <button
              type="button"
              className={`btn btn-sm ${docHeaderTitle === 'PENAWARAN' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => {
                setDocHeaderTitle('PENAWARAN');
                onShowAlert('Header dokumen diubah ke PENAWARAN');
              }}
              style={{
                flex: 1,
                height: '30px',
                padding: '0 8px',
                fontSize: '0.8rem',
                fontWeight: 600,
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              PENAWARAN
            </button>
          </div>
        </div>

        {/* Alamat Klien Input (Khusus Surat Jalan) */}
        <div className="input-group item-field-wrap" style={{ margin: 0, gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <label className="field-label" style={{ margin: 0 }}>Alamat Klien (Khusus Surat Jalan)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {suratJalanAddress !== DEFAULT_SURAT_JALAN_ADDRESS ? 'Diubah' : 'Default'}
              </span>
              {suratJalanAddress !== DEFAULT_SURAT_JALAN_ADDRESS && (
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    resetSuratJalanAddress();
                    onShowAlert('Alamat Surat Jalan dikembalikan ke default');
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '2px 8px',
                    fontSize: '0.72rem',
                    height: '24px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                  title="Reset ke alamat default"
                >
                  <Icon name="rotate-ccw" size={12} />
                  <span>Reset Alamat</span>
                </button>
              )}
            </div>
          </div>
          <textarea
            id="surat-jalan-address-input"
            className="form-input"
            rows={Math.max(3, suratJalanAddress.split('\n').length)}
            placeholder="Masukkan alamat lengkap untuk Surat Jalan..."
            value={suratJalanAddress}
            onChange={(e) => updateSuratJalanAddress(e.target.value)}
            style={{
              width: '100%',
              maxWidth: '360px',
              fontFamily: 'inherit',
              fontSize: '0.82rem',
              lineHeight: '1.45',
              resize: 'vertical',
              padding: '8px 10px',
              borderRadius: '6px',
            }}
          />
        </div>
      </div>

      {/* View Toggle Bar (Tampilan Card/Table & Mode Simple/Advance) */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '8px' }}>
        <div className="view-toggle-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          {/* Tampilan (Card & Table View) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="view-label" style={{ margin: 0 }}>Tampilan</span>
            <div className="toggle-group orange-theme">
              <button
                className={`toggle-btn ${manualViewMode === 'card' ? 'active' : ''}`}
                id="view-card-btn"
                title="Card View"
                onClick={() => setManualViewMode('card')}
              >
                <Icon name="list" size={15} />
              </button>
              <button
                className={`toggle-btn ${manualViewMode === 'table' ? 'active' : ''}`}
                id="view-table-btn"
                title="Table View"
                onClick={() => setManualViewMode('table')}
              >
                <Icon name="layout-grid-01" size={15} />
              </button>
            </div>
          </div>

          <div style={{ width: '100px', height: '1px', backgroundColor: 'var(--border-color)', margin: '0 4px' }}></div>

          {/* Mode (Simple & Advance) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="view-label" style={{ margin: 0 }}>Mode</span>
            <div className="toggle-group orange-theme">
              <button
                className={`toggle-btn ${manualCardMode === 'simple' ? 'active' : ''}`}
                id="mode-simple-btn"
                title="Simple Mode"
                onClick={() => setManualCardMode('simple')}
              >
                <Icon name="square" size={15} />
              </button>
              <button
                className={`toggle-btn ${manualCardMode === 'advance' ? 'active' : ''}`}
                id="mode-advance-btn"
                title="Advance Mode"
                onClick={() => setManualCardMode('advance')}
              >
                <Icon name="grid-01" size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div id="manual-items-wrapper" style={{ position: 'relative' }}>
        <div
          id="manual-items-container"
          className={manualViewMode === 'table' ? 'table-view-container' : ''}
        >
          {safeInvoiceItems.length === 0 ? (
            <div className="empty-state-card" style={{ textAlign: 'center', padding: '40px 20px' }}>
              <Icon name="file-02" size={32} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
              <h4 style={{ margin: '0 0 6px 0', color: 'var(--text-main)' }}>Belum Ada Barang</h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Klik tombol "+ Tambah Item" di bawah untuk memasukkan daftar barang baru.
              </p>
            </div>
          ) : manualViewMode === 'table' ? (
            /* Table View */
            <div className="manual-table-wrapper" style={{ overflowX: 'auto' }}>
              <table className="manual-items-table">
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}>#</th>
                    <th>Nama Barang / Keterangan</th>
                    <th style={{ width: '100px' }}>Tipe</th>
                    <th style={{ width: '80px' }}>Qty</th>
                    <th style={{ width: '130px' }}>Harga Satuan</th>
                    <th style={{ width: '130px' }}>Jumlah</th>
                    <th style={{ width: '40px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {safeInvoiceItems.map((item, index) => (
                    <tr key={item.id || index}>
                      <td style={{ textAlign: 'center' }}>{index + 1}</td>
                      <td>
                        <input
                          type="text"
                          className="table-input"
                          placeholder="Nama Barang"
                          value={item.name}
                          onChange={(e) =>
                            updateInvoiceItem(index, { ...item, name: e.target.value })
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="table-input"
                          placeholder="Tipe"
                          value={item.tipe}
                          onChange={(e) =>
                            updateInvoiceItem(index, { ...item, tipe: e.target.value })
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="table-input"
                          min="1"
                          value={item.qty}
                          onChange={(e) =>
                            updateInvoiceItem(index, {
                              ...item,
                              qty: Math.max(1, parseInt(e.target.value) || 1),
                            })
                          }
                          style={{ textAlign: 'center' }}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="table-input"
                          placeholder="Harga"
                          value={formatNumberStr(item.price)}
                          onChange={(e) => {
                            const val = parseInt(e.target.value.replace(/\D/g, '')) || 0;
                            updateInvoiceItem(index, { ...item, price: val });
                          }}
                        />
                      </td>
                      <td style={{ fontWeight: 600, textAlign: 'right' }}>
                        {formatCurrency(item.price * item.qty)}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          className="icon-btn danger"
                          onClick={() => deleteInvoiceItem(index)}
                        >
                          <Icon name="trash-01" size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* Card View */
            safeInvoiceItems.map((item, index) => {
              if (manualCardMode === 'advance') {
                /* Advance Card Mode */
                return (
                  <div key={item.id || index} className="item-card">
                    <button
                      className="remove-item-btn"
                      onClick={() => deleteInvoiceItem(index)}
                    >
                      <Icon name="trash-01" size={14} />
                    </button>

                    <div className="input-group item-field-wrap" style={{ marginBottom: '8px' }}>
                      <label className="field-label">
                        <strong>Invoice</strong> - Keterangan
                      </label>
                      <textarea
                        className="form-input item-inv-keterangan"
                        placeholder="Keterangan untuk Invoice"
                        rows={1}
                        value={item.invKeterangan || ''}
                        onChange={(e) =>
                          updateInvoiceItem(index, { ...item, invKeterangan: e.target.value })
                        }
                        style={{ resize: 'none', overflow: 'hidden', fontFamily: 'inherit', whiteSpace: 'pre-wrap' }}
                      />
                    </div>

                    <div className="item-row adv" style={{ marginBottom: '6px' }}>
                      <div className="item-field-wrap" style={{ flex: 1 }}>
                        <label className="field-label">
                          <strong>SurJal</strong> - Nama Barang
                        </label>
                        <div className="input-with-icon">
                          <textarea
                            className="form-input item-name"
                            placeholder="Nama Barang"
                            rows={1}
                            value={item.name || ''}
                            onChange={(e) =>
                              updateInvoiceItem(index, { ...item, name: e.target.value })
                            }
                            style={{ resize: 'none', overflow: 'hidden', paddingRight: '30px', fontFamily: 'inherit', whiteSpace: 'pre-wrap' }}
                          />
                          <button
                            className="input-icon-btn template-picker-btn"
                            onClick={onOpenTemplatePicker}
                          >
                            <Icon name="list" size={18} />
                          </button>
                        </div>
                      </div>

                      <div style={{ width: '100px', display: 'flex', flexDirection: 'column' }}>
                        <div className="unit-switch adv" style={{ margin: '0 0 5px auto', marginTop: '-4px' }}>
                          <span
                            className={`unit-opt ${(item.qtyUnit || 'pcs') === 'pcs' ? 'active' : ''}`}
                            onClick={() => updateInvoiceItem(index, { ...item, qtyUnit: 'pcs' })}
                          >
                            Pcs
                          </span>
                          <span
                            className={`unit-opt ${item.qtyUnit === 'lot' ? 'active' : ''}`}
                            onClick={() => updateInvoiceItem(index, { ...item, qtyUnit: 'lot' })}
                          >
                            Lot
                          </span>
                        </div>

                        <div className="qty-control" style={{ marginLeft: 'auto' }}>
                          <button
                            className="qty-btn minus"
                            onClick={() =>
                              updateInvoiceItem(index, {
                                ...item,
                                qty: Math.max(1, item.qty - 1),
                              })
                            }
                          >
                            -
                          </button>
                          <input
                            type="number"
                            className="qty-input item-qty"
                            value={item.qty}
                            min={1}
                            onChange={(e) =>
                              updateInvoiceItem(index, {
                                ...item,
                                qty: Math.max(1, parseInt(e.target.value) || 1),
                              })
                            }
                          />
                          <button
                            className="qty-btn plus"
                            onClick={() =>
                              updateInvoiceItem(index, { ...item, qty: item.qty + 1 })
                            }
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="input-group item-field-wrap" style={{ marginBottom: '8px' }}>
                      <label className="field-label">
                        <strong>SurJal</strong> - Keterangan
                      </label>
                      <textarea
                        className="form-input item-sj-keterangan"
                        placeholder="Keterangan untuk Surat Jalan"
                        rows={1}
                        value={item.sjKeterangan || ''}
                        onChange={(e) =>
                          updateInvoiceItem(index, { ...item, sjKeterangan: e.target.value })
                        }
                        style={{ resize: 'none', overflow: 'hidden', fontFamily: 'inherit', whiteSpace: 'pre-wrap', marginBottom: '6px' }}
                      />
                    </div>

                    <div className="item-row" style={{ alignItems: 'flex-end', marginBottom: 0, justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                        <div style={{ fontSize: '1rem', color: 'var(--bg-card)', backgroundColor: 'var(--muted)', padding: '4px 10px', borderRadius: '4px', fontWeight: 600 }}>
                          {index + 1}
                        </div>
                        <div style={{ flex: 1, maxWidth: '160px' }}>
                          <input
                            type="text"
                            className="form-input item-price-format"
                            placeholder="Harga"
                            inputMode="numeric"
                            value={formatNumberStr(item.price)}
                            onChange={(e) => {
                              const val = parseInt(e.target.value.replace(/\D/g, '')) || 0;
                              updateInvoiceItem(index, { ...item, price: val });
                            }}
                          />
                        </div>
                      </div>
                      <div style={{ fontWeight: 600, color: 'var(--primary)', paddingBottom: '4px' }}>
                        {formatCurrency(item.price * item.qty)}
                      </div>
                    </div>
                  </div>
                );
              }

              /* Simple Card Mode */
              return (
                <div key={item.id || index} className="item-card">
                  <button
                    className="remove-item-btn"
                    onClick={() => deleteInvoiceItem(index)}
                  >
                    <Icon name="trash-01" size={14} />
                  </button>

                  <div className="input-group item-field-wrap" style={{ marginBottom: '4px' }}>
                    <label className="field-label">Barang</label>
                    <div className="input-with-icon">
                      <textarea
                        className="form-input item-name"
                        placeholder="Nama Barang"
                        rows={1}
                        value={item.name || ''}
                        onChange={(e) =>
                          updateInvoiceItem(index, { ...item, name: e.target.value })
                        }
                        style={{ resize: 'none', overflow: 'hidden', paddingRight: '30px', fontFamily: 'inherit', whiteSpace: 'pre-wrap' }}
                      />
                      <button
                        className="input-icon-btn template-picker-btn"
                        onClick={onOpenTemplatePicker}
                      >
                        <Icon name="list" size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="item-row">
                    <div className="item-price-wrap" style={{ flex: 2.2, paddingTop: '4px' }}>
                      <label className="field-label">Harga</label>
                      <input
                        type="text"
                        className="form-input item-price-format"
                        placeholder="0"
                        inputMode="numeric"
                        value={formatNumberStr(item.price)}
                        onChange={(e) => {
                          const val = parseInt(e.target.value.replace(/\D/g, '')) || 0;
                          updateInvoiceItem(index, { ...item, price: val });
                        }}
                      />
                    </div>

                    <div className="item-tipe-wrap" style={{ flex: 2, paddingTop: '4px' }}>
                      <label className="field-label">Tipe</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Tipe"
                        value={item.tipe || ''}
                        onChange={(e) =>
                          updateInvoiceItem(index, { ...item, tipe: e.target.value })
                        }
                      />
                    </div>

                    <div className="item-qty-wrap" style={{ minWidth: '90px', marginTop: '17px', display: 'flex', flexDirection: 'column' }}>
                      <div className="unit-switch" style={{ margin: '0 0 6px auto' }}>
                        <span
                          className={`unit-opt ${(item.qtyUnit || 'pcs') === 'pcs' ? 'active' : ''}`}
                          onClick={() => updateInvoiceItem(index, { ...item, qtyUnit: 'pcs' })}
                        >
                          Pcs
                        </span>
                        <span
                          className={`unit-opt ${item.qtyUnit === 'lot' ? 'active' : ''}`}
                          onClick={() => updateInvoiceItem(index, { ...item, qtyUnit: 'lot' })}
                        >
                          Lot
                        </span>
                      </div>

                      <div className="qty-control" style={{ marginLeft: 'auto' }}>
                        <button
                          className="qty-btn minus"
                          onClick={() =>
                            updateInvoiceItem(index, {
                              ...item,
                              qty: Math.max(1, item.qty - 1),
                            })
                          }
                        >
                          -
                        </button>
                        <input
                          type="number"
                          className="qty-input item-qty"
                          value={item.qty}
                          min={1}
                          onChange={(e) =>
                            updateInvoiceItem(index, {
                              ...item,
                              qty: Math.max(1, parseInt(e.target.value) || 1),
                            })
                          }
                        />
                        <button
                          className="qty-btn plus"
                          onClick={() =>
                            updateInvoiceItem(index, { ...item, qty: item.qty + 1 })
                          }
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <div className="input-wrapper" style={{ position: 'relative' }}>
                      <textarea
                        className="form-textarea item-note"
                        placeholder="Deskripsi Item (wajib)"
                        rows={1}
                        value={item.note || ''}
                        onChange={(e) =>
                          updateInvoiceItem(index, { ...item, note: e.target.value })
                        }
                        style={{ paddingRight: '30px', resize: 'none', overflow: 'hidden', minHeight: '36px', lineHeight: '1.4' }}
                      />
                      <button
                        className="copy-icon-btn"
                        style={{ position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)' }}
                        onClick={() => {
                          navigator.clipboard.writeText(item.note || '');
                          onShowAlert('Deskripsi disalin');
                        }}
                        title="Copy Note"
                      >
                        <Icon name="copy-01" size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          <div className="mobile-add-group" style={{ display: 'flex', gap: '8px', alignItems: 'stretch', marginTop: '12px' }}>
            <button
              id="btn-add-item"
              className="btn btn-outline"
              style={{ flex: 1 }}
              onClick={handleAddNewBlankItem}
            >
              <Icon name="plus" size={15} /> Tambah Item
            </button>
          </div>
        </div>
      </div>

      {/* Real-time 2 PDF Preview Section */}
      {onOpenFullPreview && onDownloadDoc && (
        <InlinePreviewSection
          onOpenFullPreview={onOpenFullPreview}
          onDownloadDoc={onDownloadDoc}
        />
      )}
    </section>
  );
};
