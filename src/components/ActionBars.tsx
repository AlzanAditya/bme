import React, { useState, useEffect, useRef } from 'react';
import { useAppState } from '../context/StateContext';
import { Icon } from './Icon';

interface ActionBarsProps {
  onSaveHistory: () => void;
  onDownloadActiveFormat: (format?: 'pdf' | 'png' | 'jpeg') => void;
}

const formatCurrency = (num: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(num);
};

export const ActionBars: React.FC<ActionBarsProps> = ({
  onSaveHistory,
  onDownloadActiveFormat,
}) => {
  const { activeTab, invoiceItems, settings, updateSettings } = useAppState();
  const currentMode = activeTab?.mode || 'manual';

  const safeInvoiceItems = invoiceItems || [];

  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);
  const [desktopDropdownOpen, setDesktopDropdownOpen] = useState(false);
  const mobileRef = useRef<HTMLDivElement>(null);
  const desktopRef = useRef<HTMLDivElement>(null);

  const totalAmount = safeInvoiceItems.reduce((sum, item) => sum + item.price * item.qty, 0);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (mobileRef.current && !mobileRef.current.contains(e.target as Node)) {
        setMobileDropdownOpen(false);
      }
      if (desktopRef.current && !desktopRef.current.contains(e.target as Node)) {
        setDesktopDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (currentMode !== 'manual' && currentMode !== 'ai') return null;

  const handleSelectFormat = (format: 'pdf' | 'png' | 'jpeg') => {
    updateSettings({ defaultDownloadMethod: format });
    setMobileDropdownOpen(false);
    setDesktopDropdownOpen(false);
    onDownloadActiveFormat(format);
  };

  return (
    <>
      {currentMode === 'manual' && (
        <div id="manual-action-bar" className="action-bar-sticky">
          {/* MOBILE: total + buttons dual-pill layout */}
          <div className="mobile-action-content">
            <div className="total-display">
              <small>Total</small>
              <span id="grand-total-mobile">{formatCurrency(totalAmount)}</span>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', position: 'relative' }} ref={mobileRef}>
              <button
                id="btn-save-only-mobile"
                className="btn btn-outline"
                style={{ borderWidth: '2px', fontWeight: 600 }}
                onClick={onSaveHistory}
              >
                Simpan
              </button>
              <div className="download-split-btn" style={{ position: 'relative' }}>
                <button
                  id="btn-download-mobile"
                  className="btn btn-primary btn-lg"
                  style={{ borderRadius: '50px 0 0 50px', borderRight: '1px solid rgba(255,255,255,0.15)' }}
                  onClick={() => onDownloadActiveFormat(settings.defaultDownloadMethod)}
                >
                  Unduh
                </button>
                <button
                  id="btn-download-split-arrow-mobile"
                  className="split-arrow"
                  title="Format Ekspor Lainnya"
                  style={{ borderRadius: '0 50px 50px 0' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setMobileDropdownOpen(!mobileDropdownOpen);
                  }}
                >
                  <Icon name="chevron-up" size={14} />
                </button>
                {mobileDropdownOpen && (
                  <div
                    id="download-format-dropdown-mobile"
                    className="glass-dropdown-menu show"
                    style={{ position: 'absolute', bottom: '100%', right: 0, marginBottom: '8px', zIndex: 1000 }}
                  >
                    <button
                      className="glass-dropdown-item"
                      data-format="pdf"
                      onClick={() => handleSelectFormat('pdf')}
                    >
                      <Icon name="file-02" size={14} /> Dokumen PDF (.pdf)
                    </button>
                    <button
                      className="glass-dropdown-item"
                      data-format="png"
                      onClick={() => handleSelectFormat('png')}
                    >
                      <Icon name="image-01" size={14} /> Gambar PNG (.png)
                    </button>
                    <button
                      className="glass-dropdown-item"
                      data-format="jpeg"
                      onClick={() => handleSelectFormat('jpeg')}
                    >
                      <Icon name="image-01" size={14} /> Gambar JPEG (.jpg)
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* DESKTOP: liquid pill two-section */}
          <div className="action-bar-total">
            <span className="action-bar-total-label">Total</span>
            <span id="grand-total" className="action-bar-total-value">
              {formatCurrency(totalAmount)}
            </span>
          </div>
          <div className="action-bar-buttons" ref={desktopRef}>
            <button
              id="btn-save-only"
              className="strip-btn action-strip-btn"
              title="Simpan"
              onClick={onSaveHistory}
            >
              <Icon name="bookmark-check" size={16} />
              <span>Simpan</span>
            </button>
            <div className="action-download-group" style={{ position: 'relative' }}>
              <button
                id="btn-download"
                className="strip-btn action-strip-btn action-strip-btn--primary"
                title="Unduh"
                onClick={() => onDownloadActiveFormat(settings.defaultDownloadMethod)}
              >
                <Icon name="download-01" size={16} />
                <span>Unduh ({settings.defaultDownloadMethod?.toUpperCase() || 'PDF'})</span>
              </button>
              <button
                id="btn-download-split-arrow"
                className="strip-btn action-strip-btn action-strip-btn--arrow"
                title="Format Ekspor Lainnya"
                onClick={(e) => {
                  e.stopPropagation();
                  setDesktopDropdownOpen(!desktopDropdownOpen);
                }}
              >
                <Icon name="chevron-up" size={13} />
              </button>
              {desktopDropdownOpen && (
                <div
                  id="download-format-dropdown"
                  className="glass-dropdown-menu show"
                  style={{ position: 'absolute', bottom: '100%', right: 0, marginBottom: '8px', zIndex: 1000 }}
                >
                  <button
                    className="glass-dropdown-item"
                    data-format="pdf"
                    onClick={() => handleSelectFormat('pdf')}
                  >
                    <Icon name="file-02" size={14} /> Dokumen PDF (.pdf)
                  </button>
                  <button
                    className="glass-dropdown-item"
                    data-format="png"
                    onClick={() => handleSelectFormat('png')}
                  >
                    <Icon name="image-01" size={14} /> Gambar PNG (.png)
                  </button>
                  <button
                    className="glass-dropdown-item"
                    data-format="jpeg"
                    onClick={() => handleSelectFormat('jpeg')}
                  >
                    <Icon name="image-01" size={14} /> Gambar JPEG (.jpg)
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

