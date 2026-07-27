import React, { useEffect, useRef, useState } from 'react';
import { useAppState } from '../context/StateContext';
import { Icon } from './Icon';

interface PreviewModalProps {
  isOpen: boolean;
  type: 'invoice' | 'surat' | null;
  htmlContent: string;
  onClose: () => void;
  onDownload: () => void;
  onConfirmEdit?: () => void;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
  isOpen,
  type,
  htmlContent,
  onClose,
  onDownload,
  onConfirmEdit,
}) => {
  const { setManualEdit } = useAppState();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const modalBodyRef = useRef<HTMLDivElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [zoom, setZoom] = useState(0.5);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const titleText = type === 'invoice' ? 'Preview Invoice' : 'Preview Surat Jalan';

  // Zoom-to-fit calculation
  useEffect(() => {
    if (!isOpen || !modalBodyRef.current) return;

    const modalBody = modalBodyRef.current;
    const refWidth = 794;
    const refHeight = 1123;
    const availableWidth = modalBody.clientWidth || window.innerWidth * 0.9;
    const availableHeight = modalBody.clientHeight || window.innerHeight * 0.8;
    const scale = Math.min(availableWidth / refWidth, availableHeight / refHeight) * 0.95;

    setZoom(scale > 0 ? scale : 0.5);
    setPosition({ x: 0, y: 0 });
    setIsEditing(false);
  }, [isOpen, type]);

  // Enable / disable contentEditable inside iframe
  const toggleEditing = () => {
    if (!iframeRef.current || !iframeRef.current.contentDocument) return;

    const iframeDoc = iframeRef.current.contentDocument;

    if (isEditing) {
      // Disable editing
      iframeDoc.body.contentEditable = 'false';
      iframeDoc.body.style.outline = 'none';
      setIsEditing(false);
    } else {
      // Enable editing
      iframeDoc.body.contentEditable = 'true';
      iframeDoc.body.style.outline = '2px dashed #f39c12';
      iframeDoc.body.focus();
      setIsEditing(true);

      const handleInput = () => {
        const editedHTML =
          '<!DOCTYPE html>\n<html lang="id">\n' +
          iframeDoc.documentElement.innerHTML +
          '\n</html>';
        if (type === 'invoice' || type === 'surat') {
          setManualEdit(type === 'surat' ? 'letter' : 'invoice', editedHTML);
        }
      };

      iframeDoc.body.removeEventListener('input', handleInput);
      iframeDoc.body.addEventListener('input', handleInput);

      if (onConfirmEdit) onConfirmEdit();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="preview-modal"
      className="modal preview-modal active"
      style={{
        display: 'flex',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 1200,
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="modal-content"
        style={{
          width: '100%',
          maxWidth: '960px',
          height: '90vh',
          maxHeight: '90vh',
          backgroundColor: '#18181c',
          color: '#ffffff',
          borderRadius: '16px 16px 0 0',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          padding: 0,
          boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div
          className="modal-header"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 18px',
            backgroundColor: '#121215',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <div className="modal-title-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Icon name="file-02" size={20} style={{ color: '#e67e22' }} />
            <h3 id="preview-title" style={{ fontSize: '1.05rem', fontWeight: 600, margin: 0, color: '#ffffff' }}>
              {titleText}
            </h3>
          </div>

          <div className="modal-actions" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              id="btn-modal-edit"
              className={`btn ${isEditing ? 'btn-action-orange' : 'btn-outline'}`}
              title={isEditing ? 'Selesai Edit' : 'Edit Teks Dokumen'}
              onClick={toggleEditing}
              style={{
                padding: '6px 12px',
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                borderRadius: '6px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                background: isEditing ? '#e67e22' : 'transparent',
                color: '#ffffff',
                cursor: 'pointer',
              }}
            >
              <Icon name="edit-02" size={15} />
              <span>{isEditing ? 'Selesai' : 'Edit Teks'}</span>
            </button>

            <button
              id="preview-download-btn"
              className="btn btn-primary"
              onClick={onDownload}
              style={{
                padding: '6px 14px',
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                borderRadius: '6px',
                border: 'none',
                background: '#e67e22',
                color: '#ffffff',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              <Icon name="download-01" size={15} />
              <span>Unduh</span>
            </button>

            <button
              className="close-modal-preview icon-btn"
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#ffffff',
                marginLeft: '6px',
              }}
            >
              <Icon name="x" size={18} />
            </button>
          </div>
        </div>

        <div
          className="modal-body"
          ref={modalBodyRef}
          style={{
            flex: 1,
            backgroundColor: '#0c0c0e',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
            cursor: 'grab',
            position: 'relative',
            touchAction: 'none',
            padding: '16px',
          }}
        >
          <iframe
            ref={iframeRef}
            id="pdf-preview-frame"
            className="modal-preview-frame"
            title="Full Preview"
            srcDoc={htmlContent}
            style={{
              width: '794px',
              height: '1123px',
              flexShrink: 0,
              border: 'none',
              background: '#ffffff',
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.7)',
              borderRadius: '4px',
              pointerEvents: isEditing ? 'auto' : 'none',
              transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
            }}
          />
        </div>
      </div>
    </div>
  );
};
