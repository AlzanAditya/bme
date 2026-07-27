import React from 'react';

export interface InvoiceItem {
  id: string;
  name: string;
  tipe: string;
  note: string;
  qty: number;
  qtyUnit: string;
  price: number;
  invKeterangan?: string;
  sjKeterangan?: string;
}

export type TabMode = 'dashboard' | 'manual' | 'ai' | 'finance' | 'history';

export interface TabItem {
  id: string;
  mode: TabMode;
  title: string;
  createdAt: number;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  onboarded: boolean;
  defaultDownloadMethod: 'pdf' | 'png' | 'jpeg';
  pdfPageMode?: 'single' | 'combined';
  downloadAndSave?: boolean;
  fileNameFormat: {
    invoice: string;
    suratJalan: string;
  };
  titleRequired: boolean;
  aiDefaultPrompt?: string;
}

export interface AdminProfile {
  id?: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  raw_user_meta_data?: any;
  user_metadata?: any;
}

export interface HistoryDoc {
  id: string;
  title: string;
  date: string;
  createdAt: number;
  itemsCount: number;
  totalAmount: number;
  items: InvoiceItem[];
  manualEdits?: {
    invoice?: string | null;
    letter?: string | null;
  };
}

export interface ItemTemplate {
  id: string;
  category: string;
  name: string;
  tipe: string;
  note: string;
  qty: number;
  qtyUnit: string;
  price: number;
}

export interface FinanceRecord {
  id: string;
  type: 'income' | 'expense';
  date: string;
  amount: number;
  description: string;
  category?: string;
}

declare global {
  namespace React.JSX {
    interface IntrinsicElements {
      'i-ui': any;
    }
  }
}


