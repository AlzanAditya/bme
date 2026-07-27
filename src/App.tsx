import React, { useState } from 'react';
import { StateProvider, useAppState } from './context/StateContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ChromeTabs } from './components/ChromeTabs';
import { WorkspaceHeader } from './components/WorkspaceHeader';
import { DashboardView } from './components/DashboardView';
import { ManualView } from './components/ManualView';
import { AIView } from './components/AIView';
import { FinanceView } from './components/FinanceView';
import { HistoryView } from './components/HistoryView';
import { PreviewPanel } from './components/PreviewPanel';
import { ActionBars } from './components/ActionBars';
import { PreviewModal } from './components/PreviewModal';
import { ItemTemplatePickerModal } from './components/ItemTemplatePickerModal';
import { SettingsModal } from './components/SettingsModal';
import { AlertToast } from './components/AlertToast';

import { buildInvoiceHTML, buildSuratJalanHTML } from './lib/pdfGenerator';
import { exportToPDF, exportToPNG, exportToJPEG, formatFileName } from './lib/imageExporter';
import { HistoryDoc } from './types';

import { MobileNav } from './components/MobileNav';

const MainAppContent: React.FC = () => {
  const {
    activeTab,
    invoiceItems,
    addInvoiceItem,
    saveToHistory,
    settings,
    manualEdits,
  } = useAppState();

  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewModalType, setPreviewModalType] = useState<'invoice' | 'surat' | null>(null);
  const [previewModalHTML, setPreviewModalHTML] = useState<string>('');

  const [templatePickerOpen, setTemplatePickerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showAlert = (msg: string) => {
    setToastMessage(msg);
  };

  const currentMode = activeTab?.mode || 'manual';

  // Handle Download Logic
  const handleDownloadDoc = async (
    type: 'invoice' | 'surat',
    formatOverride?: 'pdf' | 'png' | 'jpeg'
  ) => {
    const fmt = formatOverride || settings.defaultDownloadMethod || 'pdf';
    const html =
      type === 'invoice'
        ? manualEdits.invoice || buildInvoiceHTML(invoiceItems, activeTab?.title)
        : manualEdits.letter || buildSuratJalanHTML(invoiceItems);

    const rawTemplate =
      type === 'invoice'
        ? settings.fileNameFormat?.invoice || 'Invoice-{judul}'
        : settings.fileNameFormat?.suratJalan || 'Surat Jalan-{judul}';

    const filename = formatFileName(rawTemplate, activeTab?.title || 'Draft');

    if (fmt === 'pdf') {
      exportToPDF(html, filename);
    } else if (fmt === 'png') {
      showAlert(`Mengekspor ${type === 'invoice' ? 'Invoice' : 'Surat Jalan'} ke PNG...`);
      await exportToPNG(html, filename);
    } else if (fmt === 'jpeg') {
      showAlert(`Mengekspor ${type === 'invoice' ? 'Invoice' : 'Surat Jalan'} ke JPEG...`);
      await exportToJPEG(html, filename);
    }
  };

  // Open Full Screen Preview Modal
  const handleOpenFullPreview = (type: 'invoice' | 'surat') => {
    const html =
      type === 'invoice'
        ? manualEdits.invoice || buildInvoiceHTML(invoiceItems, activeTab?.title)
        : manualEdits.letter || buildSuratJalanHTML(invoiceItems);

    setPreviewModalType(type);
    setPreviewModalHTML(html);
    setPreviewModalOpen(true);
  };

  // Open Preview for specific history document
  const handleOpenPreviewHistoryDoc = (doc: HistoryDoc, type: 'invoice' | 'surat') => {
    const html =
      type === 'invoice'
        ? (doc.manualEdits?.invoice || buildInvoiceHTML(doc.items, doc.title))
        : (doc.manualEdits?.letter || buildSuratJalanHTML(doc.items));

    setPreviewModalType(type);
    setPreviewModalHTML(html);
    setPreviewModalOpen(true);
  };

  return (
    <>
      {/* Mobile Top Header */}
      <Header onOpenSettings={() => setSettingsOpen(true)} />

      {/* Mobile Bottom Tab Navigation */}
      <MobileNav onShowAlert={showAlert} />

      {/* Primary Container (Desktop Shell Grid) */}
      <div className="app-container">
        <Sidebar onOpenSettings={() => setSettingsOpen(true)} />

        <div className="workspace-container">
          <ChromeTabs />
          <WorkspaceHeader />

          <div className="workspace-body-wrapper">
            <main id="app-content">
              <DashboardView />
              <ManualView
                onOpenTemplatePicker={() => setTemplatePickerOpen(true)}
                onShowAlert={showAlert}
                onOpenFullPreview={handleOpenFullPreview}
                onDownloadDoc={(type) => handleDownloadDoc(type)}
              />
              <AIView onShowAlert={showAlert} />
              <FinanceView />
              <HistoryView
                onOpenPreviewDoc={handleOpenPreviewHistoryDoc}
                onShowAlert={showAlert}
              />
            </main>

            <PreviewPanel
              onOpenFullPreview={handleOpenFullPreview}
              onDownloadDoc={(type) => handleDownloadDoc(type)}
            />
          </div>

          <ActionBars
            onSaveHistory={() => {
              saveToHistory();
              showAlert('Invoice berhasil disimpan ke Histori!');
            }}
            onDownloadActiveFormat={(fmt) => {
              handleDownloadDoc('invoice', fmt);
            }}
          />
        </div>
      </div>

      {/* Modals & Overlays */}
      <PreviewModal
        isOpen={previewModalOpen}
        type={previewModalType}
        htmlContent={previewModalHTML}
        onClose={() => setPreviewModalOpen(false)}
        onDownload={() => {
          if (previewModalType) handleDownloadDoc(previewModalType);
        }}
      />

      <ItemTemplatePickerModal
        isOpen={templatePickerOpen}
        onClose={() => setTemplatePickerOpen(false)}
        onSelectItem={(item) => {
          addInvoiceItem(item);
          showAlert(`Item "${item.name}" ditambahkan dari template.`);
        }}
      />

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onShowAlert={showAlert}
      />

      <AlertToast message={toastMessage} onClose={() => setToastMessage(null)} />
    </>
  );
};

export function App() {
  return (
    <StateProvider>
      <MainAppContent />
    </StateProvider>
  );
}

export default App;
