import React, { useMemo, useRef, useEffect, useState } from 'react';
import { useAppState } from '../context/StateContext';
import { buildInvoiceHTML, buildSuratJalanHTML } from '../lib/pdfGenerator';
import { Icon } from './Icon';

interface InlinePreviewSectionProps {
  onOpenFullPreview: (type: 'invoice' | 'surat') => void;
  onDownloadDoc: (type: 'invoice' | 'surat') => void;
}

export const InlinePreviewSection: React.FC<InlinePreviewSectionProps> = ({
  onOpenFullPreview,
  onDownloadDoc,
}) => {
  const { activeTab, invoiceItems, manualEdits } = useAppState();

  const invoiceHTML = useMemo(() => {
    return manualEdits.invoice || buildInvoiceHTML(invoiceItems || [], activeTab?.title);
  }, [manualEdits.invoice, invoiceItems, activeTab?.title]);

  const suratJalanHTML = useMemo(() => {
    return manualEdits.letter || buildSuratJalanHTML(invoiceItems || []);
  }, [manualEdits.letter, invoiceItems]);

  const invoiceWrapperRef = useRef<HTMLDivElement>(null);
  const letterWrapperRef = useRef<HTMLDivElement>(null);
  const [scaleInv, setScaleInv] = useState(0.28);
  const [scaleSj, setScaleSj] = useState(0.28);

  useEffect(() => {
    const computeScales = () => {
      const refWidth = 794;

      if (invoiceWrapperRef.current) {
        const w = invoiceWrapperRef.current.clientWidth;
        if (w > 0) setScaleInv(w / refWidth);
      }

      if (letterWrapperRef.current) {
        const w = letterWrapperRef.current.clientWidth;
        if (w > 0) setScaleSj(w / refWidth);
      }
    };

    computeScales();
    const timer = setTimeout(computeScales, 200);
    window.addEventListener('resize', computeScales);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', computeScales);
    };
  }, [invoiceItems, activeTab?.title]);

  return (
    <section id="preview-section" className="preview-section">
      <div className="preview-header" style={{ paddingBottom: '8px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>Preview</h3>
      </div>

      <div className="preview-cards">
        {/* Card 1: Invoice Preview */}
        <div
          className="preview-card invoice-preview"
          onClick={() => onOpenFullPreview('invoice')}
        >
          <div
            id="invoice-preview-container"
            className="preview-content"
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
          <button
            className="btn preview-card-download-btn"
            data-download-type="invoice"
            onClick={(e) => {
              e.stopPropagation();
              onDownloadDoc('invoice');
            }}
            style={{
              position: 'absolute',
              right: '10px',
              bottom: '10px',
              padding: '8px 10px',
              fontSize: '0.8rem',
              background: '#e67e22',
              borderColor: '#d35400',
              color: 'white',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Unduh Invoice"
          >
            <Icon name="download-01" size={15} />
          </button>
        </div>

        {/* Card 2: Surat Jalan Preview */}
        <div
          className="preview-card letter-preview"
          onClick={() => onOpenFullPreview('surat')}
        >
          <div
            id="letter-preview-container"
            className="preview-content"
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
          <button
            className="btn preview-card-download-btn"
            data-download-type="surat"
            onClick={(e) => {
              e.stopPropagation();
              onDownloadDoc('surat');
            }}
            style={{
              position: 'absolute',
              right: '10px',
              bottom: '10px',
              padding: '8px 10px',
              fontSize: '0.8rem',
              background: '#e67e22',
              borderColor: '#d35400',
              color: 'white',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Unduh Surat Jalan"
          >
            <Icon name="download-01" size={15} />
          </button>
        </div>
      </div>
    </section>
  );
};

