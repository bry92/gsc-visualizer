import { createContext } from 'react';
import type { GSCPerformanceRow, SEOAuditResult } from '@/types';

export interface ThemeContextValue {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export interface AuditContextValue {
  lastAudit: SEOAuditResult | null;
  setLastAudit: (audit: SEOAuditResult | null) => void;
  auditHistory: SEOAuditResult[];
  addToHistory: (audit: SEOAuditResult) => void;
}

export interface GSCContextValue {
  gscRows: GSCPerformanceRow[] | null;
  setGscRows: (rows: GSCPerformanceRow[] | null) => void;
  gscSource: string | null;
  setGscSource: (source: string | null) => void;
}

export const ThemeContext = createContext<ThemeContextValue>({
  isDarkMode: true,
  toggleTheme: () => {},
});

export const AuditContext = createContext<AuditContextValue>({
  lastAudit: null,
  setLastAudit: () => {},
  auditHistory: [],
  addToHistory: () => {},
});

export const GSCContext = createContext<GSCContextValue>({
  gscRows: null,
  setGscRows: () => {},
  gscSource: null,
  setGscSource: () => {},
});
