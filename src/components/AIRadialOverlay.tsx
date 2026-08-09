import React, { useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { useAppState } from '../context/StateContext';
import { Icon } from './Icon';

export interface AIRadialOverlayProps {
  isOpen: boolean;
  activeAction?: 'camera' | 'gallery' | 'mic' | null;
  anchorPos?: { x: number; y: number } | null;
  onClose: () => void;
  onShowAlert?: (msg: string) => void;
}

export interface AIRadialOverlayRef {
  triggerAction: (action: 'camera' | 'gallery' | 'mic') => void;
}

export const AIRadialOverlay = forwardRef<AIRadialOverlayRef, AIRadialOverlayProps>(({
  isOpen,
  activeAction,
  anchorPos,
  onClose,
  onShowAlert,
}, ref) => {
  const { navigateToMode } = useAppState();
  const [isRecording, setIsRecording] = useState(false);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const startMicRecording = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      try {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = 'id-ID';
        recognition.continuous = false;
        recognition.interimResults = false;

        setIsRecording(true);
        if (onShowAlert) onShowAlert('Mulai mendengarkan suara...');

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setIsRecording(false);
          if (onShowAlert) onShowAlert(`Teks suara: "${transcript}"`);
          const promptEl = document.getElementById('ai-prompt') as HTMLTextAreaElement;
          if (promptEl) {
            promptEl.value = promptEl.value ? `${promptEl.value} ${transcript}` : transcript;
            promptEl.dispatchEvent(new Event('input', { bubbles: true }));
          }
        };

        recognition.onerror = () => {
          setIsRecording(false);
          if (onShowAlert) onShowAlert('Perekaman suara dibatalkan atau tidak terdengar.');
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognition.start();
      } catch (err) {
        setIsRecording(false);
        if (onShowAlert) onShowAlert('Fungsi rekam suara siap di AI Mode');
      }
    } else {
      if (onShowAlert) onShowAlert('Fungsi rekam suara aktif di AI Mode');
    }
  };

  const triggerAction = (action: 'camera' | 'gallery' | 'mic') => {
    navigateToMode('ai');
    if (action === 'camera') {
      cameraInputRef.current?.click();
    } else if (action === 'gallery') {
      galleryInputRef.current?.click();
    } else if (action === 'mic') {
      startMicRecording();
    }
    onClose();
  };

  useImperativeHandle(ref, () => ({
    triggerAction,
  }));

  if (!isOpen) return null;

  const handleCameraClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerAction('camera');
  };

  const handleGalleryClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerAction('gallery');
  };

  const handleMicClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerAction('mic');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (onShowAlert) onShowAlert(`Gambar "${file.name}" berhasil diunggah ke AI.`);
    }
  };

  const anchorStyle: React.CSSProperties = anchorPos
    ? {
        position: 'fixed',
        left: `${anchorPos.x}px`,
        top: `${anchorPos.y}px`,
      }
    : {
        position: 'fixed',
        bottom: '80px',
        left: '50%',
        transform: 'translateX(-50%)',
      };

  return (
    <>
      <div
        id="ai-radial-overlay"
        className="ai-radial-overlay active"
        onClick={onClose}
        style={{ zIndex: 1050 }}
      >
        <div
          className="radial-center-anchor"
          style={anchorStyle}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="radial-ring-menu">
            {/* Camera Button at 11 o'clock */}
            <button
              id="btn-radial-camera"
              className={`radial-action-btn btn-camera ${activeAction === 'camera' ? 'active' : ''}`}
              title="Ambil Foto"
              onClick={handleCameraClick}
            >
              <Icon name="camera-02" size={24} />
            </button>

            {/* Gallery Button at 12 o'clock */}
            <button
              id="btn-radial-gallery"
              className={`radial-action-btn btn-gallery ${activeAction === 'gallery' ? 'active' : ''}`}
              title="Pilih Gambar"
              onClick={handleGalleryClick}
            >
              <Icon name="image-01" size={24} />
            </button>

            {/* Mic Button at 1 o'clock */}
            <button
              id="btn-radial-mic"
              className={`radial-action-btn btn-mic ${activeAction === 'mic' ? 'active' : ''} ${isRecording ? 'recording' : ''}`}
              title="Rekam Suara"
              onClick={handleMicClick}
            >
              <Icon name="microphone-02" size={24} />
            </button>
          </div>
        </div>
      </div>

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </>
  );
});

AIRadialOverlay.displayName = 'AIRadialOverlay';

