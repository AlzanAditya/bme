import React, { useState, useRef } from 'react';
import { useAppState } from '../context/StateContext';
import { Icon } from './Icon';
import { ItemTemplate } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowAlert?: (msg: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onShowAlert,
}) => {
  const {
    settings,
    updateSettings,
    resetSettings,
    deleteAllData,
    exportData,
    importData,
    isLoggedIn,
    adminProfile,
    login,
    logout,
    itemTemplates,
    setItemTemplates,
  } = useAppState();

  const [activeTab, setActiveTab] = useState<'general' | 'templates'>('general');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Template editing state
  const [editingTemplate, setEditingTemplate] = useState<ItemTemplate | null>(null);
  const [isAddingTemplate, setIsAddingTemplate] = useState(false);
  const [newTplName, setNewTplName] = useState('');
  const [newTplCategory, setNewTplCategory] = useState('Umum');
  const [newTplTipe, setNewTplTipe] = useState('-');
  const [newTplNote, setNewTplNote] = useState('');
  const [newTplQty, setNewTplQty] = useState(1);
  const [newTplQtyUnit, setNewTplQtyUnit] = useState('pcs');
  const [newTplPrice, setNewTplPrice] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleThemeCycle = () => {
    const nextTheme =
      settings.theme === 'system' ? 'light' : settings.theme === 'light' ? 'dark' : 'system';
    updateSettings({ theme: nextTheme });
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emailToUse = loginEmail.trim() || 'admin@flowa.id';
    login(emailToUse, 'Administrator');
    if (onShowAlert) onShowAlert('Berhasil masuk sebagai Administrator');
  };

  const handleGoogleLogin = () => {
    login('admin@flowa.id', 'Administrator');
    if (onShowAlert) onShowAlert('Berhasil masuk dengan Google');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (content && importData(content)) {
        if (onShowAlert) onShowAlert('Data berhasil diimpor!');
      } else {
        if (onShowAlert) onShowAlert('Gagal mengimpor file data');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleSaveTemplate = () => {
    if (!newTplName.trim()) {
      if (onShowAlert) onShowAlert('Nama template wajib diisi');
      return;
    }
    if (editingTemplate) {
      const updated = itemTemplates.map((t) =>
        t.id === editingTemplate.id
          ? {
              ...t,
              name: newTplName,
              category: newTplCategory,
              tipe: newTplTipe,
              note: newTplNote,
              qty: newTplQty,
              qtyUnit: newTplQtyUnit,
              price: newTplPrice,
            }
          : t
      );
      setItemTemplates(updated);
      setEditingTemplate(null);
    } else {
      const newTpl: ItemTemplate = {
        id: 'tpl-' + Date.now(),
        name: newTplName,
        category: newTplCategory,
        tipe: newTplTipe,
        note: newTplNote,
        qty: newTplQty,
        qtyUnit: newTplQtyUnit,
        price: newTplPrice,
      };
      setItemTemplates([...itemTemplates, newTpl]);
      setIsAddingTemplate(false);
    }
    resetTemplateForm();
    if (onShowAlert) onShowAlert('Template berhasil disimpan');
  };

  const resetTemplateForm = () => {
    setNewTplName('');
    setNewTplCategory('Umum');
    setNewTplTipe('-');
    setNewTplNote('');
    setNewTplQty(1);
    setNewTplQtyUnit('pcs');
    setNewTplPrice(0);
  };

  const startEditTemplate = (tpl: ItemTemplate) => {
    setEditingTemplate(tpl);
    setIsAddingTemplate(true);
    setNewTplName(tpl.name || '');
    setNewTplCategory(tpl.category || 'Umum');
    setNewTplTipe(tpl.tipe || '-');
    setNewTplNote(tpl.note || '');
    setNewTplQty(tpl.qty || 1);
    setNewTplQtyUnit(tpl.qtyUnit || 'pcs');
    setNewTplPrice(tpl.price || 0);
  };

  const handleDeleteTemplate = (id: string) => {
    if (confirm('Hapus template ini?')) {
      setItemTemplates(itemTemplates.filter((t) => t.id !== id));
      if (onShowAlert) onShowAlert('Template dihapus');
    }
  };

  return (
    <div id="settings-modal" className="modal active" style={{ display: 'flex', zIndex: 1000 }}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".json"
        style={{ display: 'none' }}
      />

      <div className="modal-content glass-modal" style={{ maxWidth: '520px', width: '92%', maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Header */}
        <div className="modal-header">
          <h2>Pengaturan</h2>
          <div style={{ display: 'flex', gap: '10px', marginLeft: 'auto', marginRight: '8px' }}>
            <button
              id="btn-theme-cycle"
              className="icon-btn"
              title={`Ganti Tema (Saat ini: ${settings.theme})`}
              onClick={handleThemeCycle}
              style={{
                background: 'transparent',
                border: '1px solid var(--border-color)',
                borderRadius: '50%',
                width: '34px',
                height: '34px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--text-main)',
              }}
            >
              <Icon name={settings.theme === 'dark' ? 'moon' : settings.theme === 'light' ? 'sun' : 'monitor-01'} size={16} />
            </button>
          </div>
          <button className="close-modal icon-btn" onClick={onClose}>
            <Icon name="x" size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '16px' }}>
          {/* LOGIN CONTAINER (Visible when NOT logged in) */}
          {!isLoggedIn ? (
            <div id="settings-login-container">
              <div
                className="guest-banner"
                style={{
                  background: 'rgba(243,156,18,0.08)',
                  border: '1px solid rgba(243,156,18,0.2)',
                  borderRadius: '12px',
                  padding: '12px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                }}
              >
                <Icon name="alert-triangle" size={20} style={{ color: '#f39c12', flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '0.8rem', lineHeight: '1.4', color: 'var(--text-main)', textAlign: 'left' }}>
                  <strong>Guest Mode Aktif</strong>
                  <br />
                  Seluruh data disimpan secara lokal di peramban ini. Masuk sebagai Administrator untuk mengaktifkan sinkronisasi aman ke Cloud.
                </div>
              </div>

              <h3 style={{ marginBottom: '12px', textAlign: 'left', fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>
                Login Administrator
              </h3>

              {/* Google OAuth Button */}
              <button
                id="btn-login-google"
                className="btn btn-full btn-google"
                onClick={handleGoogleLogin}
                style={{
                  background: '#fff',
                  color: '#333',
                  border: '1px solid #ddd',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  fontWeight: 600,
                  marginBottom: '16px',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  width: '100%',
                  cursor: 'pointer',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" style={{ flexShrink: 0 }}>
                  <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4" />
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.938 5.48 18 9 18z" fill="#34A853" />
                  <path d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707 0-.59.102-1.167.282-1.707V4.961H.957C.347 6.173 0 7.549 0 9s.347 2.827.957 4.039l3.007-2.332z" fill="#FBBC05" />
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.896 11.426 0 9 0 5.48 0 2.438 2.062.957 5.061l3.007 2.332C4.672 5.164 6.656 3.58 9 3.58z" fill="#EA4335" />
                </svg>
                Masuk dengan Google
              </button>

              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '0 8px' }}>atau</span>
                <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
              </div>

              {/* Email/Password Form */}
              <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>
                <div className="input-group" style={{ textAlign: 'left', marginBottom: 0 }}>
                  <label className="field-label" style={{ marginBottom: '6px' }}>Email Administrator</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="admin@flowa.id"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    style={{ width: '100%' }}
                  />
                </div>
                <div className="input-group" style={{ textAlign: 'left', marginBottom: '4px' }}>
                  <label className="field-label" style={{ marginBottom: '6px' }}>Kata Sandi</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    style={{ width: '100%' }}
                  />
                </div>
                <button type="submit" className="action-btn primary" style={{ padding: '10px 12px', marginTop: '4px', justifyContent: 'center' }}>
                  Masuk Sistem
                </button>
              </form>
            </div>
          ) : (
            /* AUTHENTICATED CONTENT */
            <div id="settings-authenticated-content">
              {/* Settings Tabs */}
              <div className="toggle-group orange-theme" style={{ marginBottom: '16px', display: 'flex', width: '100%' }}>
                <button
                  className={`toggle-btn ${activeTab === 'general' ? 'active' : ''}`}
                  style={{ flex: 1 }}
                  onClick={() => setActiveTab('general')}
                >
                  Umum
                </button>
                <button
                  className={`toggle-btn ${activeTab === 'templates' ? 'active' : ''}`}
                  style={{ flex: 1 }}
                  onClick={() => setActiveTab('templates')}
                >
                  Templates
                </button>
              </div>

              {activeTab === 'general' ? (
                <div id="settings-general">
                  {/* Admin Account Section */}
                  <div
                    className="setting-section"
                    style={{ padding: '4px 8px 16px 8px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}
                  >
                    <div
                      className="admin-profile-card"
                      style={{
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '16px',
                        padding: '16px',
                        textAlign: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                        marginBottom: '16px',
                      }}
                    >
                      <div
                        style={{
                          position: 'relative',
                          display: 'inline-block',
                          marginBottom: '10px',
                        }}
                      >
                        {adminProfile?.avatar_url ? (
                          <img
                            src={adminProfile.avatar_url}
                            alt="Avatar"
                            style={{
                              width: '64px',
                              height: '64px',
                              borderRadius: '50%',
                              objectFit: 'cover',
                              border: '2px solid var(--primary)',
                              margin: '0 auto',
                              display: 'block',
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: '64px',
                              height: '64px',
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, var(--primary), #d4880d)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#fff',
                              fontSize: '1.5rem',
                              fontWeight: 700,
                              border: '2px solid var(--primary)',
                              margin: '0 auto',
                            }}
                          >
                            A
                          </div>
                        )}
                      </div>

                      <h3 style={{ fontSize: '1.05rem', marginTop: '4px', marginBottom: '2px', fontWeight: 600, color: 'var(--text-main)' }}>
                        {adminProfile?.full_name || 'Administrator'}
                      </h3>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                        {adminProfile?.email || 'admin@flowa.id'}
                      </p>

                      <span
                        className="admin-badge"
                        style={{
                          display: 'inline-block',
                          padding: '4px 10px',
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          background: 'linear-gradient(90deg, #d4880d, #f39c12)',
                          color: '#fff',
                          borderRadius: '50px',
                          boxShadow: '0 2px 8px rgba(243,156,18,0.3)',
                        }}
                      >
                        Administrator
                      </span>
                    </div>

                    <div className="settings-list" style={{ marginBottom: '16px' }}>
                      <div className="setting-row" style={{ padding: '12px 4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div className="setting-info" style={{ textAlign: 'left' }}>
                          <span className="setting-label" style={{ fontSize: '0.95rem', fontWeight: 600, display: 'block' }}>
                            Sinkronisasi Cloud
                          </span>
                          <span className="setting-subtext" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            Tersambung dan tersinkronisasi
                          </span>
                        </div>
                        <div className="setting-control">
                          <button
                            className="btn btn-sm btn-outline"
                            onClick={() => {
                              if (onShowAlert) onShowAlert('Data tersinkronkan ke Cloud!');
                            }}
                            style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                          >
                            <Icon name="refresh-cw" size={12} /> Sync
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      className="btn btn-outline btn-full"
                      onClick={() => {
                        logout();
                        if (onShowAlert) onShowAlert('Telah keluar dari akun');
                      }}
                      style={{
                        color: '#ff4d4f',
                        borderColor: '#ff4d4f',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        padding: '10px',
                        width: '100%',
                        cursor: 'pointer',
                        borderRadius: '8px',
                      }}
                    >
                      <Icon name="log-out" size={14} /> Keluar Akun
                    </button>
                  </div>

                  {/* Download Format */}
                  <div className="setting-section" style={{ marginBottom: '16px' }}>
                    <div className="setting-info" style={{ marginBottom: '8px', textAlign: 'left' }}>
                      <span className="setting-label" style={{ fontWeight: 600, display: 'block' }}>Format Unduhan</span>
                      <span className="setting-subtext" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Pilih format file utama saat mengunduh.
                      </span>
                    </div>
                    <div className="segmented-control" style={{ display: 'flex', gap: '8px' }}>
                      {(['pdf', 'png', 'jpeg'] as const).map((fmt) => (
                        <button
                          key={fmt}
                          className={`segmented-btn ${settings.defaultDownloadMethod === fmt ? 'active' : ''}`}
                          onClick={() => updateSettings({ defaultDownloadMethod: fmt })}
                          style={{ flex: 1, padding: '8px', textTransform: 'uppercase' }}
                        >
                          {fmt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Mode Halaman PDF */}
                  <div className="setting-section" style={{ marginBottom: '16px' }}>
                    <div className="setting-info" style={{ marginBottom: '8px', textAlign: 'left' }}>
                      <span className="setting-label" style={{ fontWeight: 600, display: 'block' }}>Mode Halaman PDF</span>
                      <span className="setting-subtext" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Cetak Invoice & Surat Jalan terpisah atau dalam satu dokumen.
                      </span>
                    </div>
                    <div className="segmented-control" style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className={`segmented-btn ${(settings.pdfPageMode || 'single') === 'single' ? 'active' : ''}`}
                        onClick={() => updateSettings({ pdfPageMode: 'single' })}
                        style={{ flex: 1, padding: '8px' }}
                      >
                        Satu per Satu
                      </button>
                      <button
                        className={`segmented-btn ${settings.pdfPageMode === 'combined' ? 'active' : ''}`}
                        onClick={() => updateSettings({ pdfPageMode: 'combined' })}
                        style={{ flex: 1, padding: '8px' }}
                      >
                        Bersamaan
                      </button>
                    </div>
                  </div>

                  {/* Switched Settings */}
                  <div className="settings-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ textAlign: 'left' }}>
                        <span style={{ fontWeight: 600, display: 'block' }}>Judul Wajib Diisi</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Cegah unduhan tanpa judul invoice.</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.titleRequired !== false}
                        onChange={(e) => updateSettings({ titleRequired: e.target.checked })}
                        style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ textAlign: 'left' }}>
                        <span style={{ fontWeight: 600, display: 'block' }}>Unduh & Simpan</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tombol unduh juga akan menyimpan data ke histori.</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.downloadAndSave || false}
                        onChange={(e) => updateSettings({ downloadAndSave: e.target.checked })}
                        style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ textAlign: 'left' }}>
                        <span style={{ fontWeight: 600, display: 'block' }}>Sync Data</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Impor / Ekspor riwayat aplikasi.</span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          className="btn btn-sm btn-outline"
                          onClick={() => fileInputRef.current?.click()}
                          style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                        >
                          Import
                        </button>
                        <button
                          className="btn btn-sm btn-outline"
                          onClick={exportData}
                          style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                        >
                          Export
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Format Nama File */}
                  <div className="setting-section" style={{ textAlign: 'left', marginBottom: '16px' }}>
                    <div className="setting-info" style={{ marginBottom: '8px' }}>
                      <span className="setting-label" style={{ fontWeight: 600, display: 'block' }}>Format Nama File</span>
                      <span className="setting-subtext" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Gunakan <code>{'{judul}'}</code> sebagai placeholder.
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ position: 'relative' }}>
                        <small style={{ position: 'absolute', right: '12px', top: '10px', color: 'var(--text-muted)', fontSize: '0.65rem' }}>
                          Invoice
                        </small>
                        <input
                          type="text"
                          className="form-input"
                          value={settings.fileNameFormat?.invoice || 'Invoice-{judul}'}
                          onChange={(e) =>
                            updateSettings({
                              fileNameFormat: {
                                ...settings.fileNameFormat,
                                invoice: e.target.value,
                              },
                            })
                          }
                          style={{ fontSize: '0.85rem' }}
                        />
                      </div>
                      <div style={{ position: 'relative' }}>
                        <small style={{ position: 'absolute', right: '12px', top: '10px', color: 'var(--text-muted)', fontSize: '0.65rem' }}>
                          Surat Jalan
                        </small>
                        <input
                          type="text"
                          className="form-input"
                          value={settings.fileNameFormat?.suratJalan || 'Surat Jalan-{judul}'}
                          onChange={(e) =>
                            updateSettings({
                              fileNameFormat: {
                                ...settings.fileNameFormat,
                                suratJalan: e.target.value,
                              },
                            })
                          }
                          style={{ fontSize: '0.85rem' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Prompt Default AI */}
                  <div className="setting-section" style={{ textAlign: 'left', marginBottom: '16px' }}>
                    <div className="setting-info" style={{ marginBottom: '8px' }}>
                      <span className="setting-label" style={{ fontWeight: 600, display: 'block' }}>Prompt Default AI</span>
                      <span className="setting-subtext" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Instruksi dasar yang dikirimkan ke sistem AI.
                      </span>
                    </div>
                    <textarea
                      className="form-textarea"
                      value={settings.aiDefaultPrompt || ''}
                      onChange={(e) => updateSettings({ aiDefaultPrompt: e.target.value })}
                      style={{ fontSize: '0.85rem', minHeight: '80px', width: '100%' }}
                      placeholder="Masukkan instruksi default AI..."
                    />
                  </div>

                  {/* Danger Zone */}
                  <div style={{ padding: '8px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <button
                      className="btn btn-outline btn-full"
                      onClick={() => {
                        if (confirm('Reset semua pengaturan ke standar awal?')) {
                          resetSettings();
                          if (onShowAlert) onShowAlert('Pengaturan telah direset');
                        }
                      }}
                      style={{ color: '#f39c12', borderColor: '#f39c12', width: '100%', borderRadius: '8px', padding: '10px' }}
                    >
                      <Icon name="refresh-cw" size={14} /> Reset Semua Pengaturan
                    </button>
                    <button
                      className="btn btn-outline btn-full"
                      onClick={() => {
                        if (confirm('APAKAH ANDA YAKIN? Semua item, histori, dan data lokal akan dihapus permanen!')) {
                          deleteAllData();
                          if (onShowAlert) onShowAlert('Semua data telah dihapus');
                        }
                      }}
                      style={{ color: '#ff4d4f', borderColor: '#ff4d4f', width: '100%', borderRadius: '8px', padding: '10px' }}
                    >
                      <Icon name="trash-01" size={14} /> Hapus Semua Data
                    </button>
                  </div>
                </div>
              ) : (
                /* TEMPLATES TAB */
                <div id="settings-templates" style={{ textAlign: 'left' }}>
                  <div className="setting-section">
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '4px' }}>Kelola Template</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                      Buat template untuk item yang sering digunakan.
                    </p>

                    {isAddingTemplate ? (
                      <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px', marginBottom: '12px', background: 'var(--bg-surface)' }}>
                        <h4 style={{ fontSize: '0.9rem', marginBottom: '8px' }}>
                          {editingTemplate ? 'Edit Template' : 'Tambah Template Baru'}
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="Nama Item (Wajib)"
                            value={newTplName}
                            onChange={(e) => setNewTplName(e.target.value)}
                          />
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                              type="text"
                              className="form-input"
                              placeholder="Kategori"
                              value={newTplCategory}
                              onChange={(e) => setNewTplCategory(e.target.value)}
                              style={{ flex: 1 }}
                            />
                            <select
                              className="form-input"
                              value={newTplTipe}
                              onChange={(e) => setNewTplTipe(e.target.value)}
                              style={{ flex: 1 }}
                            >
                              <option value="-">-</option>
                              <option value="ICA">ICA</option>
                              <option value="Protecta">Protecta</option>
                              <option value="Prolink">Prolink</option>
                              <option value="APC">APC</option>
                            </select>
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                              type="number"
                              className="form-input"
                              placeholder="Harga (Rp)"
                              value={newTplPrice || ''}
                              onChange={(e) => setNewTplPrice(parseFloat(e.target.value) || 0)}
                              style={{ flex: 1 }}
                            />
                            <input
                              type="number"
                              className="form-input"
                              placeholder="Qty"
                              value={newTplQty}
                              onChange={(e) => setNewTplQty(parseInt(e.target.value) || 1)}
                              style={{ width: '70px' }}
                            />
                            <select
                              className="form-input"
                              value={newTplQtyUnit}
                              onChange={(e) => setNewTplQtyUnit(e.target.value)}
                              style={{ width: '80px' }}
                            >
                              <option value="pcs">pcs</option>
                              <option value="lot">lot</option>
                            </select>
                          </div>
                          <textarea
                            className="form-textarea"
                            placeholder="Deskripsi / Catatan"
                            rows={2}
                            value={newTplNote}
                            onChange={(e) => setNewTplNote(e.target.value)}
                          />
                          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                            <button className="action-btn primary compact" onClick={handleSaveTemplate} style={{ flex: 1, justifyContent: 'center' }}>
                              Simpan Template
                            </button>
                            <button
                              className="btn btn-outline btn-sm"
                              onClick={() => {
                                setIsAddingTemplate(false);
                                setEditingTemplate(null);
                                resetTemplateForm();
                              }}
                            >
                              Batal
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : null}

                    <div id="template-list" style={{ maxHeight: '300px', overflowY: 'auto', margin: '10px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {itemTemplates.length === 0 ? (
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '16px' }}>
                          Belum ada template tersimpan.
                        </p>
                      ) : (
                        itemTemplates.map((tpl) => (
                          <div
                            key={tpl.id}
                            style={{
                              border: '1px solid var(--border-color)',
                              borderRadius: '8px',
                              padding: '10px 12px',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              background: 'var(--bg-surface)',
                            }}
                          >
                            <div>
                              <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{tpl.name}</div>
                              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                {tpl.category || 'Umum'} • Rp {new Intl.NumberFormat('id-ID').format(tpl.price || 0)} ({tpl.qty || 1} {tpl.qtyUnit || 'pcs'})
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <button
                                className="icon-btn"
                                onClick={() => startEditTemplate(tpl)}
                                title="Edit Template"
                                style={{ padding: '4px' }}
                              >
                                <Icon name="edit-02" size={16} />
                              </button>
                              <button
                                className="icon-btn"
                                onClick={() => handleDeleteTemplate(tpl.id)}
                                title="Hapus Template"
                                style={{ padding: '4px', color: '#ff4d4f' }}
                              >
                                <Icon name="trash-01" size={16} />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {!isAddingTemplate && (
                      <button
                        id="btn-add-template"
                        className="btn btn-sm btn-outline btn-full"
                        onClick={() => {
                          resetTemplateForm();
                          setEditingTemplate(null);
                          setIsAddingTemplate(true);
                        }}
                        style={{ width: '100%', padding: '8px', marginTop: '8px' }}
                      >
                        + Tambah Template Baru
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
