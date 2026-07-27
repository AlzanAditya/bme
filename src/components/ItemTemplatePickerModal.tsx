import React, { useState } from 'react';
import { DEFAULT_ITEM_TEMPLATES } from '../data/itemTemplates';
import { InvoiceItem, ItemTemplate } from '../types';
import { Icon } from './Icon';

interface ItemTemplatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectItem: (item: InvoiceItem) => void;
}

export const ItemTemplatePickerModal: React.FC<ItemTemplatePickerModalProps> = ({
  isOpen,
  onClose,
  onSelectItem,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('Semua');

  if (!isOpen) return null;

  const categories = ['Semua', ...Array.from(new Set(DEFAULT_ITEM_TEMPLATES.map((t) => t.category)))];

  const filtered = DEFAULT_ITEM_TEMPLATES.filter((tpl) => {
    const matchesCat = activeCategory === 'Semua' || tpl.category === activeCategory;
    const matchesQuery =
      tpl.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tpl.note.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tpl.tipe.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const handleSelect = (tpl: ItemTemplate) => {
    const item: InvoiceItem = {
      id: 'item-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      name: tpl.name,
      tipe: tpl.tipe,
      note: tpl.note,
      qty: tpl.qty,
      qtyUnit: tpl.qtyUnit,
      price: tpl.price,
    };
    onSelectItem(item);
    onClose();
  };

  return (
    <div className="modal active" style={{ display: 'flex', zIndex: 1000 }}>
      <div className="modal-content glass-modal" style={{ maxWidth: '600px', width: '90%' }}>
        <div className="modal-header">
          <div className="modal-title-group">
            <Icon name="list" size={20} />
            <h3>Pilih Template Barang / Jasa</h3>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <Icon name="x" size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '16px' }}>
          <div className="search-bar" style={{ marginBottom: '12px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Cari template barang..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '10px 14px' }}
            />
          </div>

          <div
            className="category-chips"
            style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}
          >
            {categories.map((cat) => (
              <button
                key={cat}
                className={`segmented-btn ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
                style={{ fontSize: '0.8rem', padding: '4px 12px' }}
              >
                {cat}
              </button>
            ))}
          </div>

          <div
            className="template-list"
            style={{
              maxHeight: '350px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            {filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                Tidak ada template ditemukan.
              </div>
            ) : (
              filtered.map((tpl) => (
                <div
                  key={tpl.id}
                  className="template-card"
                  onClick={() => handleSelect(tpl)}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-surface)',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{tpl.name}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {tpl.note}
                    </span>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontWeight: 700, color: 'var(--primary)', display: 'block' }}>
                      Rp {new Intl.NumberFormat('id-ID').format(tpl.price)}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {tpl.qty} {tpl.qtyUnit}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
