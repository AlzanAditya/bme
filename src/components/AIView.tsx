import React, { useState } from 'react';
import { useAppState } from '../context/StateContext';
import { InvoiceItem } from '../types';
import { Icon } from './Icon';

interface AIViewProps {
  onShowAlert: (msg: string) => void;
}

export const AIView: React.FC<AIViewProps> = ({ onShowAlert }) => {
  const { activeTab, setInvoiceItems, navigateToMode } = useAppState();

  const [promptText, setPromptText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemini-3.5-flash');

  const isAIView = activeTab?.mode === 'ai';
  if (!isAIView) return null;

  const handleProcessText = async () => {
    if (!promptText.trim()) {
      onShowAlert('Masukkan teks atau instruksi AI terlebih dahulu');
      return;
    }

    setIsProcessing(true);

    try {
      const res = await fetch('/api/extract-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptText }),
      });

      if (!res.ok) {
        throw new Error('Gagal memproses dengan AI');
      }

      const data = await res.json();
      if (Array.isArray(data.items) && data.items.length > 0) {
        const parsedItems: InvoiceItem[] = data.items.map((item: any) => ({
          id: 'item-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
          name: item.name || '',
          tipe: item.tipe || '-',
          note: item.note || '',
          qty: Number(item.qty) || 1,
          qtyUnit: item.qtyUnit || 'pcs',
          price: Number(item.price) || 0,
        }));

        setInvoiceItems(parsedItems);
        onShowAlert(`Berhasil mengekstrak ${parsedItems.length} item!`);
        navigateToMode('manual');
      } else {
        onShowAlert('AI tidak menemukan item invoice yang valid.');
      }
    } catch (err) {
      console.error('AI Processing Error:', err);
      // Fallback local rule parser
      const lines = promptText.split('\n').filter((l) => l.trim());
      const extractedItems: InvoiceItem[] = lines.map((line, idx) => {
        const qtyMatch = line.match(/(\d+)\s*(pcs|unit|lot)?/i);
        const priceMatch = line.match(/(\d[\d\.\,]*000)/);

        const qty = qtyMatch ? parseInt(qtyMatch[1]) : 1;
        const qtyUnit = qtyMatch && qtyMatch[2] ? qtyMatch[2].toLowerCase() : 'pcs';
        let price = 0;
        if (priceMatch) {
          price = parseInt(priceMatch[1].replace(/\D/g, '')) || 0;
        }

        return {
          id: 'item-' + Date.now() + '-' + idx,
          name: line.split(/harga|rp/i)[0].trim(),
          tipe: '-',
          note: '',
          qty,
          qtyUnit,
          price,
        };
      });

      if (extractedItems.length > 0) {
        setInvoiceItems(extractedItems);
        onShowAlert(`Berhasil mengekstrak ${extractedItems.length} item (Lokal)!`);
        navigateToMode('manual');
      } else {
        onShowAlert('Gagal memproses instruksi AI.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <section id="ai-view" className="view active" style={{ position: 'relative' }}>
      <div className="ai-prompt-container">
        <div id="ai-file-context-container" className="ai-file-context-container"></div>
        <textarea
          id="ai-prompt"
          className={`form-textarea ai-prompt-textarea ${isMaximized ? 'maximized' : ''}`}
          placeholder="Contoh: Kabel NYM 50 meter harga 15rb, MCB 10 pcs harga 50rb..."
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
        ></textarea>

        <div className="ai-prompt-actions-bar">
          {/* Div 1: Left (Resize & Model Dropdown) */}
          <div className="ai-prompt-actions-left">
            <button
              id="btn-ai-prompt-resize"
              className="icon-btn"
              title="Besarkan / Kecilkan"
              onClick={() => setIsMaximized(!isMaximized)}
            >
              <Icon name={isMaximized ? 'minimize-02' : 'maximize-02'} size={16} />
            </button>
            <div className="custom-select ai-model-select" id="ai-model-select">
              <div className="select-selected form-input">
                <span className="selected-text">{selectedModel}</span>
                <Icon name="chevron-down" size={14} style={{ opacity: 0.5, flexShrink: 0, marginLeft: '4px' }} />
              </div>
            </div>
          </div>

          {/* Div 2: Right (Camera, Gallery, Mic, Generate) */}
          <div className="ai-prompt-actions-right">
            <button id="btn-ai-camera" className="icon-btn" title="Buka Kamera">
              <Icon name="camera-02" size={16} />
            </button>
            <button id="btn-ai-gallery" className="icon-btn" title="Pilih dari Galeri">
              <Icon name="image-01" size={16} />
            </button>
            <button id="btn-ai-mic" className="icon-btn" title="Mikrofon">
              <Icon name="microphone-02" size={16} />
            </button>
            <button
              id="btn-ai-generate"
              className="btn btn-primary btn-sm"
              onClick={handleProcessText}
              disabled={isProcessing}
            >
              {isProcessing ? (
                '...'
              ) : (
                <Icon name="chevron-right" size={15} style={{ marginRight: '4px' }} />
              )}
            </button>
          </div>
        </div>
      </div>

      <input type="file" id="ai-camera-input" accept="image/*" capture="environment" style={{ display: 'none' }} />
      <input type="file" id="ai-gallery-input" accept="image/*" style={{ display: 'none' }} />

      {/* Output Container for generated cards */}
      <div id="ai-output-container" className="ai-output-container"></div>
    </section>
  );
};
