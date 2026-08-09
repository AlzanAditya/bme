import React, { useMemo, useRef, useEffect, useState } from 'react';
import { useAppState } from '../context/StateContext';
import { buildInvoiceHTML, buildSuratJalanHTML } from '../lib/pdfGenerator';
import { Icon } from './Icon';

interface PreviewPanelProps {
  onOpenFullPreview: (type: 'invoice' | 'surat') => void;
  onDownloadDoc: (type: 'invoice' | 'surat') => void;
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({
  onOpenFullPreview,
  onDownloadDoc,
}) => {
  const {
    activeTab,
    invoiceItems,
    previewCollapsed,
    togglePreviewCollapsed,
    manualEdits,
    clientName,
    suratJalanAddress,
    docDate,
    showPaymentInfo,
    docHeaderTitle,
  } = useAppState();

  const currentMode = activeTab?.mode || 'manual';
  const isPreviewEnabled = currentMode === 'manual' || currentMode === 'ai';

  const invoiceHTML = useMemo(() => {
    return (
      manualEdits.invoice ||
      buildInvoiceHTML(invoiceItems, activeTab?.title, clientName, showPaymentInfo, docDate, docHeaderTitle)
    );
  }, [manualEdits.invoice, invoiceItems, activeTab?.title, clientName, showPaymentInfo, docDate, docHeaderTitle]);

  const suratJalanHTML = useMemo(() => {
    return (
      manualEdits.letter ||
      buildSuratJalanHTML(invoiceItems, clientName, docDate, suratJalanAddress)
    );
  }, [manualEdits.letter, invoiceItems, clientName, docDate, suratJalanAddress]);

  const invoiceWrapperRef = useRef<HTMLDivElement>(null);
  const letterWrapperRef = useRef<HTMLDivElement>(null);
  const [scaleInv, setScaleInv] = useState(0.4);
  const [scaleSj, setScaleSj] = useState(0.4);

  // Compute auto-scale for A4 preview iframe
  useEffect(() => {
    const computeScales = () => {
      const refWidth = 794;
      const refHeight = 1123;

      if (invoiceWrapperRef.current) {
        const w = invoiceWrapperRef.current.clientWidth || refWidth;
        const h = invoiceWrapperRef.current.clientHeight || refHeight;
        const s = Math.min(w / refWidth, h / refHeight);
        setScaleInv(s > 0 ? s : 0.4);
      }

      if (letterWrapperRef.current) {
        const w = letterWrapperRef.current.clientWidth || refWidth;
        const h = letterWrapperRef.current.clientHeight || refHeight;
        const s = Math.min(w / refWidth, h / refHeight);
        setScaleSj(s > 0 ? s : 0.4);
      }
    };

    computeScales();
    window.addEventListener('resize', computeScales);
    return () => window.removeEventListener('resize', computeScales);
  }, [isPreviewEnabled, previewCollapsed]);

  if (!isPreviewEnabled) return null;

  return (
    <>
      {/* Collapsed Strip on Desktop */}
      {previewCollapsed && (
        <aside
          id="collapsed-preview-strip"
          className="collapsed-preview-strip"
        >
          <button
            id="btn-preview-expand"
            className="preview-expand-btn"
            title="Buka Panel Dokumen"
            onClick={togglePreviewCollapsed}
          >
            <Icon name="file-02" size={18} />
            <span className="strip-label">Pratinjau Dokumen</span>
          </button>
        </aside>
      )}

      {/* Desktop Preview Panel */}
      <aside
        id="desktop-preview-panel"
        className={`desktop-preview-panel ${previewCollapsed ? 'collapsed' : ''}`}
      >
        <div className="preview-panel-header">
          <div className="preview-panel-title">
            <Icon name="file-02" size={18} />
            <span>Pratinjau Dokumen</span>
          </div>
          <button
            id="btn-preview-collapse"
            className="preview-collapse-btn"
            title="Sembunyikan Preview"
            onClick={togglePreviewCollapsed}
          >
            <Icon name="x" size={16} />
          </button>
        </div>

        <div className="preview-panel-body" id="desktop-preview-body">
          <div className="preview-cards">
            {/* Invoice Card */}
            <div
              className="preview-card invoice-preview"
              onClick={() => onOpenFullPreview('invoice')}
            >
              <div className="preview-card-header">
                <h3>Invoice</h3>
                <button
                  className="preview-card-download-btn"
                  data-download-type="invoice"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDownloadDoc('invoice');
                  }}
                >
                  <Icon name="download-01" size={14} />
                  <span>Unduh</span>
                </button>
              </div>
              <div
                className="preview-frame-container"
                id="invoice-preview-container"
                ref={invoiceWrapperRef}
              >
                <div className="a4-preview-wrapper">
                  <iframe
                    className="a4-preview-frame"
                    data-template-frame="1"
                    title="Preview Invoice"
                    srcDoc={invoiceHTML}
                    style={{ transform: `scale(${scaleInv})` }}
                  />
                </div>
              </div>
            </div>

            {/* Surat Jalan Card */}
            <div
              className="preview-card letter-preview"
              onClick={() => onOpenFullPreview('surat')}
            >
              <div className="preview-card-header">
                <h3>Surat Jalan</h3>
                <button
                  className="preview-card-download-btn"
                  data-download-type="surat"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDownloadDoc('surat');
                  }}
                >
                  <Icon name="download-01" size={14} />
                  <span>Unduh</span>
                </button>
              </div>
              <div
                className="preview-frame-container"
                id="letter-preview-container"
                ref={letterWrapperRef}
              >
                <div className="a4-preview-wrapper">
                  <iframe
                    className="a4-preview-frame"
                    data-template-frame="1"
                    title="Preview Surat Jalan"
                    srcDoc={suratJalanHTML}
                    style={{ transform: `scale(${scaleSj})` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
