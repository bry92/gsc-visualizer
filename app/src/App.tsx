import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import type { FirebaseError } from 'firebase/app';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SiteAudit from './tools/SiteAudit';
import KeywordResearch from './tools/KeywordResearch';
import BacklinkAnalyzer from './tools/BacklinkAnalyzer';
import CompetitorAnalysis from './tools/CompetitorAnalysis';
import RankTracker from './tools/RankTracker';
import SiteHealth from './tools/SiteHealth';
import Reports from './tools/Reports';
import GSCDataVisualizer from './tools/GSCDataVisualizer';
import CTROptimizer from './tools/CTROptimizer';
import QueryIntentClassifier from './tools/QueryIntentClassifier';
import IntentReshaper from './tools/IntentReshaper';
import Settings from './pages/Settings';
import Page from './pages/Page';
import type { GSCPerformanceRow, SEOAuditResult } from './types';
import type { AccountPlan } from './contexts/app-context';
import { AuditContext, AuthContext, GSCContext, ThemeContext } from './contexts/app-context';
import { firebaseAuth, isFirebaseConfigured } from './lib/firebase';
import { applySeo } from './utils/seo';
import './App.css';

const ACCOUNT_PLAN_STORAGE_KEY = 'seo-pro-plan';
const LOCAL_AUTH_STORAGE_KEY = 'seo-pro-local-auth';

type LocalAuthSession = {
  email: string;
  id: string;
};

function readLocalAuthSession(): LocalAuthSession | null {
  if (typeof window === 'undefined') return null;

  const raw = window.localStorage.getItem(LOCAL_AUTH_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<LocalAuthSession>;
    if (!parsed.email || !parsed.id) {
      return null;
    }
    return {
      email: parsed.email,
      id: parsed.id,
    };
  } catch {
    return null;
  }
}

function saveLocalAuthSession(email: string) {
  if (typeof window === 'undefined') return;

  const session: LocalAuthSession = {
    email,
    id: `local-${email}`,
  };
  window.localStorage.setItem(LOCAL_AUTH_STORAGE_KEY, JSON.stringify(session));
}

function clearLocalAuthSession() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(LOCAL_AUTH_STORAGE_KEY);
}

function isAuthConfigurationError(error: unknown): boolean {
  const code = (error as FirebaseError | { code?: string })?.code;
  return code === 'auth/configuration-not-found';
}

function getStoredPlan(): AccountPlan {
  if (typeof window === 'undefined') return 'free';

  const storedPlan = window.localStorage.getItem(ACCOUNT_PLAN_STORAGE_KEY);
  if (storedPlan === 'pro' || storedPlan === 'agency') {
    return storedPlan;
  }

  return 'free';
}

function App() {
  const location = useLocation();
  const localSession = readLocalAuthSession();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [lastAudit, setLastAudit] = useState<SEOAuditResult | null>(null);
  const [auditHistory, setAuditHistory] = useState<SEOAuditResult[]>([]);
  const [gscRows, setGscRows] = useState<GSCPerformanceRow[] | null>(null);
  const [gscSource, setGscSource] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(localSession?.email ?? null);
  const [userId, setUserId] = useState<string | null>(localSession?.id ?? null);
  const [userPlan, setUserPlanState] = useState<AccountPlan>(() => getStoredPlan());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(Boolean(localSession));
  const [isUsingLocalAuth, setIsUsingLocalAuth] = useState<boolean>(Boolean(localSession));
  const [authLoading, setAuthLoading] = useState(isFirebaseConfigured);

  useEffect(() => {
    if (!isFirebaseConfigured || !firebaseAuth || isUsingLocalAuth) {
      setAuthLoading(false);
      return;
    }

    const unsub = onAuthStateChanged(firebaseAuth, (user) => {
      setIsAuthenticated(Boolean(user));
      setUserId(user?.uid ?? null);
      setUserEmail(user?.email ?? null);
      setAuthLoading(false);
    });
    return () => unsub();
  }, [isUsingLocalAuth]);

  useEffect(() => {
    applySeo(location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    const root = document.getElementById('root');
    if (!root) return;

    const syncInertWithAriaHidden = () => {
      const hidden = root.getAttribute('aria-hidden') === 'true';
      if (hidden) {
        root.setAttribute('inert', '');
      } else {
        root.removeAttribute('inert');
      }
    };

    syncInertWithAriaHidden();
    const observer = new MutationObserver(syncInertWithAriaHidden);
    observer.observe(root, { attributes: true, attributeFilter: ['aria-hidden'] });
    return () => observer.disconnect();
  }, []);

  const addToHistory = useCallback((audit: SEOAuditResult) => {
    setAuditHistory(prev => [audit, ...prev].slice(0, 10));
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDarkMode((prev) => !prev);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    if (!isFirebaseConfigured || !firebaseAuth || isUsingLocalAuth) {
      setIsUsingLocalAuth(true);
      saveLocalAuthSession(email);
      setIsAuthenticated(true);
      setUserEmail(email);
      setUserId(`local-${email}`);
      return;
    }

    try {
      await signInWithEmailAndPassword(firebaseAuth, email, password);
    } catch (error) {
      if (isAuthConfigurationError(error)) {
        setIsUsingLocalAuth(true);
        saveLocalAuthSession(email);
        setIsAuthenticated(true);
        setUserEmail(email);
        setUserId(`local-${email}`);
        return;
      }
      throw error;
    }
  }, [isUsingLocalAuth]);

  const register = useCallback(async (email: string, password: string) => {
    if (!isFirebaseConfigured || !firebaseAuth || isUsingLocalAuth) {
      setIsUsingLocalAuth(true);
      saveLocalAuthSession(email);
      setIsAuthenticated(true);
      setUserEmail(email);
      setUserId(`local-${email}`);
      return;
    }

    try {
      await createUserWithEmailAndPassword(firebaseAuth, email, password);
    } catch (error) {
      if (isAuthConfigurationError(error)) {
        setIsUsingLocalAuth(true);
        saveLocalAuthSession(email);
        setIsAuthenticated(true);
        setUserEmail(email);
        setUserId(`local-${email}`);
        return;
      }
      throw error;
    }
  }, [isUsingLocalAuth]);

  const logout = useCallback(async () => {
    clearLocalAuthSession();

    if (isUsingLocalAuth || !firebaseAuth) {
      setIsUsingLocalAuth(false);
      setIsAuthenticated(false);
      setUserEmail(null);
      setUserId(null);
      return;
    }

    await signOut(firebaseAuth);
  }, [isUsingLocalAuth]);

  const setUserPlan = useCallback((plan: AccountPlan) => {
    setUserPlanState(plan);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(ACCOUNT_PLAN_STORAGE_KEY, plan);
    }
  }, []);

  const user = useMemo(() => {
    if (!isAuthenticated || !userEmail) {
      return null;
    }

    return {
      id: userId ?? userEmail,
      email: userEmail,
      plan: userPlan,
    };
  }, [isAuthenticated, userEmail, userId, userPlan]);

  const isPro = userPlan === 'pro' || userPlan === 'agency';

  const themeContextValue = useMemo(
    () => ({ isDarkMode, toggleTheme }),
    [isDarkMode, toggleTheme],
  );

  const auditContextValue = useMemo(
    () => ({ lastAudit, setLastAudit, auditHistory, addToHistory }),
    [lastAudit, auditHistory, addToHistory],
  );

  const gscContextValue = useMemo(
    () => ({ gscRows, setGscRows, gscSource, setGscSource }),
    [gscRows, gscSource],
  );

  const authContextValue = useMemo(
    () => ({ user, isAuthenticated, isPro, userEmail, authLoading, setUserPlan, login, register, logout }),
    [user, isAuthenticated, isPro, userEmail, authLoading, setUserPlan, login, register, logout],
  );

  return (
    <ThemeContext.Provider value={themeContextValue}>
      <AuditContext.Provider value={auditContextValue}>
        <GSCContext.Provider value={gscContextValue}>
          <AuthContext.Provider value={authContextValue}>
            <div className={`min-h-screen ${isDarkMode ? 'bg-dark' : 'bg-white'}`}>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route
                  path="/login"
                  element={
                    authLoading ? (
                      <FullScreenLoading />
                    ) : isAuthenticated ? (
                      <Navigate to="/dashboard" replace />
                    ) : (
                      <Login />
                    )
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute isAuthenticated={isAuthenticated} authLoading={authLoading}>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tools/audit"
                  element={
                    <ProtectedRoute isAuthenticated={isAuthenticated} authLoading={authLoading}>
                      <SiteAudit />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tools/keywords"
                  element={
                    <ProtectedRoute isAuthenticated={isAuthenticated} authLoading={authLoading}>
                      <KeywordResearch />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tools/backlinks"
                  element={
                    <ProtectedRoute isAuthenticated={isAuthenticated} authLoading={authLoading}>
                      <BacklinkAnalyzer />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tools/competitors"
                  element={
                    <ProtectedRoute isAuthenticated={isAuthenticated} authLoading={authLoading}>
                      <CompetitorAnalysis />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tools/rank-tracker"
                  element={
                    <ProtectedRoute isAuthenticated={isAuthenticated} authLoading={authLoading}>
                      <RankTracker />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tools/site-health"
                  element={
                    <ProtectedRoute isAuthenticated={isAuthenticated} authLoading={authLoading}>
                      <SiteHealth />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tools/reports"
                  element={
                    <ProtectedRoute isAuthenticated={isAuthenticated} authLoading={authLoading}>
                      <Reports />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tools/gsc-visualizer"
                  element={
                    <ProtectedRoute isAuthenticated={isAuthenticated} authLoading={authLoading}>
                      <GSCDataVisualizer />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tools/ctr-optimizer"
                  element={
                    <ProtectedRoute isAuthenticated={isAuthenticated} authLoading={authLoading}>
                      <CTROptimizer />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tools/intent-classifier"
                  element={
                    <ProtectedRoute isAuthenticated={isAuthenticated} authLoading={authLoading}>
                      <QueryIntentClassifier />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tools/intent-reshaper"
                  element={
                    <ProtectedRoute isAuthenticated={isAuthenticated} authLoading={authLoading}>
                      <IntentReshaper />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/todos"
                  element={
                    <ProtectedRoute isAuthenticated={isAuthenticated} authLoading={authLoading}>
                      <Page />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute isAuthenticated={isAuthenticated} authLoading={authLoading}>
                      <Settings />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </AuthContext.Provider>
        </GSCContext.Provider>
      </AuditContext.Provider>
    </ThemeContext.Provider>
  );
}

function ProtectedRoute({
  isAuthenticated,
  authLoading,
  children,
}: {
  isAuthenticated: boolean;
  authLoading: boolean;
  children: React.ReactElement;
}) {
  const location = useLocation();
  if (authLoading) {
    return <FullScreenLoading />;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}

function FullScreenLoading() {
  return (
    <main className="min-h-screen bg-dark flex items-center justify-center" aria-label="Loading">
      <div className="w-10 h-10 border-4 border-lime/20 border-t-lime rounded-full animate-spin" />
    </main>
  );
}

export default App;
