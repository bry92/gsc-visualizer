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

export interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isPro: boolean;
  userEmail: string | null;
  authLoading: boolean;
  setUserPlan: (plan: AccountPlan) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export type AccountPlan = 'free' | 'pro' | 'agency';

export interface AuthUser {
  id: string;
  email: string;
  plan: AccountPlan;
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

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  isAuthenticated: false,
  isPro: false,
  userEmail: null,
  authLoading: true,
  setUserPlan: () => {},
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});
