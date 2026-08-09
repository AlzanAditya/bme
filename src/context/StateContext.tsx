import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { InvoiceItem, TabItem, TabMode, AppSettings, HistoryDoc, ItemTemplate, AdminProfile } from '../types';
import { DEFAULT_ITEM_TEMPLATES } from '../data/itemTemplates';

export const DEFAULT_CLIENT_NAME = 'PT. SARASWANTI INDO GENETECH';
export const DEFAULT_SURAT_JALAN_ADDRESS = `Jl. Rasamala, Jl. Ring Road Yasmin No. 20,
RT.02/RW.03, Curugmekar,
Kec. Bogor Barat
Kota Bogor 16113`;

const STORAGE_KEYS = {
  TABS: 'bme_tabs',
  ACTIVE_TAB: 'bme_active_tab',
  INVOICE_ITEMS: 'bme_invoice_items',
  SETTINGS: 'bme_settings',
  HISTORY: 'bme_history',
  ITEM_TEMPLATES: 'bme_item_templates',
  SIDEBAR_COLLAPSED: 'bme_sidebar_collapsed',
  PREVIEW_COLLAPSED: 'bme_preview_collapsed',
  TOOLBAR_COLLAPSED: 'bme_toolbar_collapsed',
  LABELS_HIDDEN: 'bme_labels_hidden',
  MANUAL_VIEW_MODE: 'bme_manual_view_mode',
  MANUAL_CARD_MODE: 'bme_manual_card_mode',
  IS_LOGGED_IN: 'bme_is_logged_in',
  ADMIN_PROFILE: 'bme_admin_profile',
  CLIENT_NAME: 'bme_client_name',
  SURAT_JALAN_ADDRESS: 'bme_surat_jalan_address',
  SHOW_PAYMENT_INFO: 'bme_show_payment_info',
  DOC_DATE: 'bme_doc_date',
  DOC_HEADER_TITLE: 'bme_doc_header_title',
};

const DEFAULT_AI_PROMPT =
  'Ekstrak data faktur/invoice dari teks mentah berikut. Format harus terstruktur dengan membagi data menjadi satu atau beberapa judul invoice. Untuk setiap judul, kelompokkan item ke dalam list. Setiap item harus memiliki field: name (nama barang/jasa, default "..." jika kosong), tipe (pilih salah satu dari: "-", "ICA", "Protecta", "Prolink", "APC"), qtyUnit (unit kuantitas: "pcs" atau "lot", default "pcs"), qty (kuantitas integer, default 1), price (harga integer satuan, default 0), dan note (catatan tambahan, default "..." jika kosong).';

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  onboarded: false,
  defaultDownloadMethod: 'pdf',
  pdfPageMode: 'single',
  downloadAndSave: false,
  fileNameFormat: {
    invoice: 'Invoice-{judul}',
    suratJalan: 'Surat Jalan-{judul}',
  },
  titleRequired: true,
  aiDefaultPrompt: DEFAULT_AI_PROMPT,
};

const DEFAULT_TAB: TabItem = {
  id: 'tab-1',
  mode: 'manual',
  title: '',
  createdAt: Date.now(),
};

interface StateContextType {
  tabs: TabItem[];
  activeTabId: string;
  activeTab: TabItem | undefined;
  invoiceItems: InvoiceItem[];
  settings: AppSettings;
  history: HistoryDoc[];
  itemTemplates: ItemTemplate[];
  manualViewMode: 'card' | 'table';
  manualCardMode: 'simple' | 'advance';
  sidebarCollapsed: boolean;
  previewCollapsed: boolean;
  toolbarCollapsed: boolean;
  labelsHidden: boolean;
  manualEdits: { invoice: string | null; letter: string | null };
  clientName: string;
  suratJalanAddress: string;
  docDate: string;
  showPaymentInfo: boolean;
  docHeaderTitle: 'INVOICE' | 'PENAWARAN';

  // Auth State
  isLoggedIn: boolean;
  adminProfile: AdminProfile | null;
  login: (email?: string, fullName?: string, avatarUrl?: string) => void;
  logout: () => void;

  // Actions
  createNewTab: (mode?: TabMode, title?: string) => string;
  switchTab: (tabId: string) => void;
  closeTab: (tabId: string) => void;
  navigateToMode: (mode: TabMode) => void;
  updateActiveTabTitle: (title: string) => void;

  setInvoiceItems: (items: InvoiceItem[]) => void;
  addInvoiceItem: (item: InvoiceItem) => void;
  updateInvoiceItem: (index: number, item: InvoiceItem) => void;
  deleteInvoiceItem: (index: number) => void;
  clearInvoiceItems: () => void;
  reorderInvoiceItems: (startIndex: number, endIndex: number) => void;

  setItemTemplates: (templates: ItemTemplate[]) => void;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  resetSettings: () => void;
  deleteAllData: () => void;
  exportData: () => void;
  importData: (jsonStr: string) => boolean;

  saveToHistory: (title?: string) => void;
  deleteHistoryItem: (id: string) => void;
  updateHistoryTitle: (id: string, newTitle: string) => void;
  loadHistoryItemToActiveTab: (doc: HistoryDoc) => void;

  setManualViewMode: (mode: 'card' | 'table') => void;
  setManualCardMode: (mode: 'simple' | 'advance') => void;
  toggleSidebarCollapsed: () => void;
  togglePreviewCollapsed: () => void;
  toggleToolbarCollapsed: () => void;
  toggleLabelsHidden: () => void;

  setManualEdit: (type: 'invoice' | 'letter', html: string | null) => void;
  clearManualEdits: () => void;

  updateClientName: (name: string) => void;
  resetClientName: () => void;
  updateSuratJalanAddress: (addr: string) => void;
  resetSuratJalanAddress: () => void;
  updateDocDate: (date: string) => void;
  setShowPaymentInfo: (show: boolean) => void;
  toggleShowPaymentInfo: () => void;
  setDocHeaderTitle: (title: 'INVOICE' | 'PENAWARAN') => void;
  toggleDocHeaderTitle: () => void;
}

const StateContext = createContext<StateContextType | undefined>(undefined);

export const StateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Initial State Loaders
  const [tabs, setTabs] = useState<TabItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TABS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to parse tabs from localStorage', e);
    }
    return [DEFAULT_TAB];
  });

  const [activeTabId, setActiveTabId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_TAB);
      if (saved) return saved;
    } catch (e) {
      console.error('Failed to parse activeTabId', e);
    }
    return 'tab-1';
  });

  const [invoiceItems, setInvoiceItemsState] = useState<InvoiceItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.INVOICE_ITEMS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Failed to parse invoiceItems', e);
    }
    return [];
  });

  const [settings, setSettingsState] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error('Failed to parse settings', e);
    }
    return DEFAULT_SETTINGS;
  });

  const [history, setHistoryState] = useState<HistoryDoc[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HISTORY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Failed to parse history', e);
    }
    return [];
  });

  const [itemTemplates, setItemTemplatesState] = useState<ItemTemplate[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ITEM_TEMPLATES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to parse itemTemplates', e);
    }
    return DEFAULT_ITEM_TEMPLATES;
  });

  const setItemTemplates = useCallback((templates: ItemTemplate[]) => {
    setItemTemplatesState(templates);
    localStorage.setItem(STORAGE_KEYS.ITEM_TEMPLATES, JSON.stringify(templates));
  }, []);

  const [manualViewMode, setManualViewModeState] = useState<'card' | 'table'>(() => {
    return (localStorage.getItem(STORAGE_KEYS.MANUAL_VIEW_MODE) as 'card' | 'table') || 'card';
  });

  const [manualCardMode, setManualCardModeState] = useState<'simple' | 'advance'>(() => {
    return (localStorage.getItem(STORAGE_KEYS.MANUAL_CARD_MODE) as 'simple' | 'advance') || 'simple';
  });

  const [sidebarCollapsed, setSidebarCollapsedState] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.SIDEBAR_COLLAPSED) === 'true';
  });

  const [previewCollapsed, setPreviewCollapsedState] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.PREVIEW_COLLAPSED) === 'true';
  });

  const [toolbarCollapsed, setToolbarCollapsedState] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.TOOLBAR_COLLAPSED) === 'true';
  });

  const [labelsHidden, setLabelsHiddenState] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.LABELS_HIDDEN) === 'true';
  });

  const [manualEdits, setManualEdits] = useState<{ invoice: string | null; letter: string | null }>({
    invoice: null,
    letter: null,
  });

  const [clientName, setClientNameState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CLIENT_NAME);
      if (saved !== null) return saved;
    } catch (e) {
      console.error('Failed to parse clientName', e);
    }
    return DEFAULT_CLIENT_NAME;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CLIENT_NAME, clientName);
  }, [clientName]);

  const [suratJalanAddress, setSuratJalanAddressState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SURAT_JALAN_ADDRESS);
      if (saved !== null) return saved;
    } catch (e) {
      console.error('Failed to parse suratJalanAddress', e);
    }
    return DEFAULT_SURAT_JALAN_ADDRESS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SURAT_JALAN_ADDRESS, suratJalanAddress);
  }, [suratJalanAddress]);

  const [docDate, setDocDateState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DOC_DATE);
      if (saved !== null) return saved;
    } catch (e) {
      console.error('Failed to parse docDate', e);
    }
    return '';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DOC_DATE, docDate);
  }, [docDate]);

  const [showPaymentInfo, setShowPaymentInfoState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SHOW_PAYMENT_INFO);
      if (saved !== null) return saved === 'true';
    } catch (e) {
      console.error('Failed to parse showPaymentInfo', e);
    }
    return true;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SHOW_PAYMENT_INFO, String(showPaymentInfo));
  }, [showPaymentInfo]);

  const [docHeaderTitle, setDocHeaderTitleState] = useState<'INVOICE' | 'PENAWARAN'>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DOC_HEADER_TITLE);
      if (saved === 'INVOICE' || saved === 'PENAWARAN') return saved;
    } catch (e) {
      console.error('Failed to parse docHeaderTitle', e);
    }
    return 'INVOICE';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DOC_HEADER_TITLE, docHeaderTitle);
  }, [docHeaderTitle]);

  // Active Tab Derived State
  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  // Sync Document HTML Theme Attribute
  useEffect(() => {
    const applyTheme = (t: string) => {
      let effectiveTheme = t;
      if (t === 'system') {
        effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      document.documentElement.setAttribute('data-theme', effectiveTheme);
    };

    applyTheme(settings.theme || 'system');

    const matchMedia = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = () => {
      if ((settings.theme || 'system') === 'system') {
        applyTheme('system');
      }
    };

    matchMedia.addEventListener('change', handleSystemThemeChange);
    return () => matchMedia.removeEventListener('change', handleSystemThemeChange);
  }, [settings.theme]);

  // Sync Body Label Visibility Classes
  useEffect(() => {
    if (labelsHidden) {
      document.body.classList.add('labels-hidden', 'hide-labels');
    } else {
      document.body.classList.remove('labels-hidden', 'hide-labels');
    }
  }, [labelsHidden]);

  // Sync Sidebar & Preview Body Classes
  useEffect(() => {
    document.body.classList.toggle('sidebar-collapsed', sidebarCollapsed);
  }, [sidebarCollapsed]);

  useEffect(() => {
    document.body.classList.toggle('preview-collapsed', previewCollapsed);
  }, [previewCollapsed]);

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TABS, JSON.stringify(tabs));
  }, [tabs]);

  useEffect(() => {
    if (activeTabId) localStorage.setItem(STORAGE_KEYS.ACTIVE_TAB, activeTabId);
  }, [activeTabId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INVOICE_ITEMS, JSON.stringify(invoiceItems));
  }, [invoiceItems]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  }, [history]);

  // Auth State Loader
  const [isLoggedIn, setIsLoggedInState] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN) === 'true';
  });

  const [adminProfile, setAdminProfileState] = useState<AdminProfile | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ADMIN_PROFILE);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse adminProfile', e);
    }
    return null;
  });

  const login = useCallback((email = 'admin@flowa.id', fullName = 'Administrator', avatarUrl = '') => {
    const profile: AdminProfile = {
      email,
      full_name: fullName,
      avatar_url: avatarUrl,
    };
    setIsLoggedInState(true);
    setAdminProfileState(profile);
    localStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'true');
    localStorage.setItem(STORAGE_KEYS.ADMIN_PROFILE, JSON.stringify(profile));
  }, []);

  const logout = useCallback(() => {
    setIsLoggedInState(false);
    setAdminProfileState(null);
    localStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'false');
    localStorage.removeItem(STORAGE_KEYS.ADMIN_PROFILE);
  }, []);

  const resetSettings = useCallback(() => {
    setSettingsState(DEFAULT_SETTINGS);
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
  }, []);

  const deleteAllData = useCallback(() => {
    setInvoiceItemsState([]);
    setHistoryState([]);
    setItemTemplatesState(DEFAULT_ITEM_TEMPLATES);
    setManualEdits({ invoice: null, letter: null });
    localStorage.removeItem(STORAGE_KEYS.INVOICE_ITEMS);
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
    localStorage.setItem(STORAGE_KEYS.ITEM_TEMPLATES, JSON.stringify(DEFAULT_ITEM_TEMPLATES));
  }, []);

  const exportData = useCallback(() => {
    const exportObj = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      settings,
      history,
      itemTemplates,
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportObj, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `bme_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }, [settings, history, itemTemplates]);

  const importData = useCallback((jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.settings) setSettingsState((prev) => ({ ...prev, ...parsed.settings }));
      if (Array.isArray(parsed.history)) setHistoryState(parsed.history);
      if (Array.isArray(parsed.itemTemplates)) setItemTemplates(parsed.itemTemplates);
      return true;
    } catch (e) {
      console.error('Failed to import JSON data', e);
      return false;
    }
  }, [setItemTemplates]);

  // Actions
  const createNewTab = useCallback((mode: TabMode = 'manual', title = '') => {
    const newTab: TabItem = {
      id: 'tab-' + Date.now(),
      mode,
      title: title || (mode === 'manual' ? 'Draft Invoice' : mode.toUpperCase()),
      createdAt: Date.now(),
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTab.id);
    return newTab.id;
  }, []);

  const switchTab = useCallback((tabId: string) => {
    setActiveTabId(tabId);
  }, []);

  const closeTab = useCallback((tabId: string) => {
    setTabs((prev) => {
      if (prev.length <= 1) return prev; // Don't close last tab
      const nextTabs = prev.filter((t) => t.id !== tabId);
      if (tabId === activeTabId) {
        const closedIndex = prev.findIndex((t) => t.id === tabId);
        const newActive = nextTabs[Math.max(0, closedIndex - 1)];
        if (newActive) setActiveTabId(newActive.id);
      }
      return nextTabs;
    });
  }, [activeTabId]);

  const navigateToMode = useCallback((mode: TabMode) => {
    setTabs((prev) => {
      const activeIndex = prev.findIndex((t) => t.id === activeTabId);
      if (activeIndex !== -1) {
        const updated = [...prev];
        updated[activeIndex] = { ...updated[activeIndex], mode };
        return updated;
      }
      return prev;
    });
  }, [activeTabId]);

  const updateActiveTabTitle = useCallback((title: string) => {
    setTabs((prev) => {
      const activeIndex = prev.findIndex((t) => t.id === activeTabId);
      if (activeIndex !== -1) {
        const updated = [...prev];
        updated[activeIndex] = { ...updated[activeIndex], title };
        return updated;
      }
      return prev;
    });
  }, [activeTabId]);

  const setInvoiceItems = useCallback((items: InvoiceItem[]) => {
    setInvoiceItemsState(items);
  }, []);

  const addInvoiceItem = useCallback((item: InvoiceItem) => {
    setInvoiceItemsState((prev) => [...prev, item]);
  }, []);

  const updateInvoiceItem = useCallback((index: number, updatedItem: InvoiceItem) => {
    setInvoiceItemsState((prev) => {
      const next = [...prev];
      next[index] = updatedItem;
      return next;
    });
  }, []);

  const deleteInvoiceItem = useCallback((index: number) => {
    setInvoiceItemsState((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearInvoiceItems = useCallback(() => {
    setInvoiceItemsState([]);
  }, []);

  const reorderInvoiceItems = useCallback((startIndex: number, endIndex: number) => {
    setInvoiceItemsState((prev) => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    });
  }, []);

  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettingsState((prev) => ({ ...prev, ...newSettings }));
  }, []);

  const saveToHistory = useCallback((customTitle?: string) => {
    const titleToSave = customTitle || activeTab?.title || 'Invoice Tanpa Judul';
    const totalAmount = invoiceItems.reduce((sum, item) => sum + item.price * item.qty, 0);

    const doc: HistoryDoc = {
      id: 'doc-' + Date.now(),
      title: titleToSave,
      clientName,
      suratJalanAddress,
      docDate,
      showPaymentInfo,
      docHeaderTitle,
      date: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      createdAt: Date.now(),
      itemsCount: invoiceItems.length,
      totalAmount,
      items: JSON.parse(JSON.stringify(invoiceItems)),
      manualEdits: { ...manualEdits },
    };

    setHistoryState((prev) => [doc, ...prev]);
  }, [activeTab?.title, invoiceItems, manualEdits, clientName, suratJalanAddress, docDate, showPaymentInfo, docHeaderTitle]);

  const deleteHistoryItem = useCallback((id: string) => {
    setHistoryState((prev) => prev.filter((doc) => doc.id !== id));
  }, []);

  const updateHistoryTitle = useCallback((id: string, newTitle: string) => {
    setHistoryState((prev) =>
      prev.map((doc) => (doc.id === id ? { ...doc, title: newTitle } : doc))
    );
  }, []);

  const loadHistoryItemToActiveTab = useCallback((doc: HistoryDoc) => {
    setInvoiceItemsState(doc.items || []);
    updateActiveTabTitle(doc.title);
    if (doc.clientName) {
      setClientNameState(doc.clientName);
    }
    if (doc.suratJalanAddress) {
      setSuratJalanAddressState(doc.suratJalanAddress);
    }
    if (doc.docDate !== undefined) {
      setDocDateState(doc.docDate);
    }
    if (doc.showPaymentInfo !== undefined) {
      setShowPaymentInfoState(doc.showPaymentInfo);
    }
    if (doc.docHeaderTitle !== undefined) {
      setDocHeaderTitleState(doc.docHeaderTitle);
    }
    if (doc.manualEdits) {
      setManualEdits({
        invoice: doc.manualEdits.invoice || null,
        letter: doc.manualEdits.letter || null,
      });
    } else {
      setManualEdits({ invoice: null, letter: null });
    }
  }, [updateActiveTabTitle]);

  const updateClientName = useCallback((name: string) => {
    setClientNameState(name);
  }, []);

  const resetClientName = useCallback(() => {
    setClientNameState(DEFAULT_CLIENT_NAME);
  }, []);

  const updateSuratJalanAddress = useCallback((addr: string) => {
    setSuratJalanAddressState(addr);
  }, []);

  const resetSuratJalanAddress = useCallback(() => {
    setSuratJalanAddressState(DEFAULT_SURAT_JALAN_ADDRESS);
  }, []);

  const updateDocDate = useCallback((date: string) => {
    setDocDateState(date);
  }, []);

  const setShowPaymentInfo = useCallback((show: boolean) => {
    setShowPaymentInfoState(show);
  }, []);

  const toggleShowPaymentInfo = useCallback(() => {
    setShowPaymentInfoState((prev) => !prev);
  }, []);

  const setDocHeaderTitle = useCallback((title: 'INVOICE' | 'PENAWARAN') => {
    setDocHeaderTitleState(title);
  }, []);

  const toggleDocHeaderTitle = useCallback(() => {
    setDocHeaderTitleState((prev) => (prev === 'INVOICE' ? 'PENAWARAN' : 'INVOICE'));
  }, []);

  const setManualViewMode = useCallback((mode: 'card' | 'table') => {
    setManualViewModeState(mode);
    localStorage.setItem(STORAGE_KEYS.MANUAL_VIEW_MODE, mode);
  }, []);

  const setManualCardMode = useCallback((mode: 'simple' | 'advance') => {
    setManualCardModeState(mode);
    localStorage.setItem(STORAGE_KEYS.MANUAL_CARD_MODE, mode);
  }, []);

  const toggleSidebarCollapsed = useCallback(() => {
    setSidebarCollapsedState((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, String(next));
      return next;
    });
  }, []);

  const togglePreviewCollapsed = useCallback(() => {
    setPreviewCollapsedState((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEYS.PREVIEW_COLLAPSED, String(next));
      return next;
    });
  }, []);

  const toggleToolbarCollapsed = useCallback(() => {
    setToolbarCollapsedState((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEYS.TOOLBAR_COLLAPSED, String(next));
      return next;
    });
  }, []);

  const toggleLabelsHidden = useCallback(() => {
    setLabelsHiddenState((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEYS.LABELS_HIDDEN, String(next));
      return next;
    });
  }, []);

  const setManualEdit = useCallback((type: 'invoice' | 'letter', html: string | null) => {
    setManualEdits((prev) => ({ ...prev, [type]: html }));
  }, []);

  const clearManualEdits = useCallback(() => {
    setManualEdits({ invoice: null, letter: null });
  }, []);

  return (
    <StateContext.Provider
      value={{
        tabs,
        activeTabId,
        activeTab,
        invoiceItems,
        settings,
        history,
        itemTemplates,
        manualViewMode,
        manualCardMode,
        sidebarCollapsed,
        previewCollapsed,
        toolbarCollapsed,
        labelsHidden,
        manualEdits,
        clientName,
        suratJalanAddress,
        docDate,
        showPaymentInfo,
        docHeaderTitle,

        isLoggedIn,
        adminProfile,
        login,
        logout,

        createNewTab,
        switchTab,
        closeTab,
        navigateToMode,
        updateActiveTabTitle,

        setInvoiceItems,
        addInvoiceItem,
        updateInvoiceItem,
        deleteInvoiceItem,
        clearInvoiceItems,
        reorderInvoiceItems,

        setItemTemplates,
        updateSettings,
        resetSettings,
        deleteAllData,
        exportData,
        importData,
        saveToHistory,
        deleteHistoryItem,
        updateHistoryTitle,
        loadHistoryItemToActiveTab,

        setManualViewMode,
        setManualCardMode,
        toggleSidebarCollapsed,
        togglePreviewCollapsed,
        toggleToolbarCollapsed,
        toggleLabelsHidden,

        setManualEdit,
        clearManualEdits,
        updateClientName,
        resetClientName,
        updateSuratJalanAddress,
        resetSuratJalanAddress,
        updateDocDate,
        setShowPaymentInfo,
        toggleShowPaymentInfo,
        setDocHeaderTitle,
        toggleDocHeaderTitle,
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(StateContext);
  if (!context) {
    throw new Error('useAppState must be used within a StateProvider');
  }
  return context;
};
