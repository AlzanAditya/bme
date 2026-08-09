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
    clientName,
    suratJalanAddress,
    docDate,
    showPaymentInfo,
    docHeaderTitle,
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

  // Global Auto-Resize Effect for all Textareas
  React.useEffect(() => {
    const resizeTextarea = (ta: HTMLTextAreaElement) => {
      if (ta.classList.contains('maximized')) return;
      if (ta.offsetParent === null && ta.scrollHeight === 0) return;

      ta.style.height = 'auto';
      const scrollH = ta.scrollHeight;
      if (scrollH > 0) {
        ta.style.height = `${scrollH}px`;
      }
    };

    const resizeAllTextareas = () => {
      document.querySelectorAll<HTMLTextAreaElement>('textarea').forEach((ta) => {
        resizeTextarea(ta);
      });
    };

    // Initial resize
    resizeAllTextareas();

    const handleInput = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target && target.tagName === 'TEXTAREA') {
        resizeTextarea(target as HTMLTextAreaElement);
      }
    };

    const handleFocus = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target && target.tagName === 'TEXTAREA') {
        resizeTextarea(target as HTMLTextAreaElement);
      }
    };

    document.addEventListener('input', handleInput);
    document.addEventListener('focusin', handleFocus);

    const observer = new MutationObserver(() => {
      resizeAllTextareas();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['value', 'class', 'rows'],
    });

    window.addEventListener('resize', resizeAllTextareas);

    return () => {
      document.removeEventListener('input', handleInput);
      document.removeEventListener('focusin', handleFocus);
      observer.disconnect();
      window.removeEventListener('resize', resizeAllTextareas);
    };
  }, []);

  const currentMode = activeTab?.mode || 'manual';

  // Handle Download Logic
  const handleDownloadDoc = async (
    type: 'invoice' | 'surat',
    formatOverride?: 'pdf' | 'png' | 'jpeg'
  ) => {
    const fmt = formatOverride || settings.defaultDownloadMethod || 'pdf';
    const html =
      type === 'invoice'
        ? manualEdits.invoice || buildInvoiceHTML(invoiceItems, activeTab?.title, clientName, showPaymentInfo, docDate, docHeaderTitle)
        : manualEdits.letter || buildSuratJalanHTML(invoiceItems, clientName, docDate, suratJalanAddress);

    const rawTemplate =
      type === 'invoice'
        ? settings.fileNameFormat?.invoice || 'Invoice-{judul}'
        : settings.fileNameFormat?.suratJalan || 'Surat Jalan-{judul}';

    const filename = formatFileName(rawTemplate, activeTab?.title || 'Draft');

    if (fmt === 'pdf') {
      showAlert(`Mengekspor ${type === 'invoice' ? 'Invoice' : 'Surat Jalan'} ke PDF...`);
      await exportToPDF(html, filename);
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
        ? manualEdits.invoice || buildInvoiceHTML(invoiceItems, activeTab?.title, clientName, showPaymentInfo, docDate, docHeaderTitle)
        : manualEdits.letter || buildSuratJalanHTML(invoiceItems, clientName, docDate, suratJalanAddress);

    setPreviewModalType(type);
    setPreviewModalHTML(html);
    setPreviewModalOpen(true);
  };

  // Open Preview for specific history document
  const handleOpenPreviewHistoryDoc = (doc: HistoryDoc, type: 'invoice' | 'surat') => {
    const docClientName = doc.clientName || clientName;
    const docAddress = doc.suratJalanAddress || suratJalanAddress;
    const docDocDate = doc.docDate !== undefined ? doc.docDate : docDate;
    const docShowPaymentInfo = doc.showPaymentInfo !== undefined ? doc.showPaymentInfo : showPaymentInfo;
    const docDocHeaderTitle = doc.docHeaderTitle || docHeaderTitle;

    const html =
      type === 'invoice'
        ? (doc.manualEdits?.invoice || buildInvoiceHTML(doc.items, doc.title, docClientName, docShowPaymentInfo, docDocDate, docDocHeaderTitle))
        : (doc.manualEdits?.letter || buildSuratJalanHTML(doc.items, docClientName, docDocDate, docAddress));

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
