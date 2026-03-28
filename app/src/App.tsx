import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy, useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { Analytics } from '@vercel/analytics/react';
import type { GSCPerformanceRow, SEOAuditResult } from './types';
import type { AccountPlan } from './contexts/app-context';
import { AuditContext, AuthContext, GSCContext, ThemeContext } from './contexts/app-context';
import { auth, isFirebaseConfigured } from './lib/firebase';
import './App.css';

declare global {
  interface Window {
    AssistLoopWidget?: {
      init: (options: { agentId: string }) => void;
    };
    __assistLoopInitialized?: boolean;
  }
}

const ASSISTLOOP_AGENT_ID = import.meta.env.VITE_ASSISTLOOP_AGENT_ID;
const ASSISTLOOP_SCRIPT_ID = 'assistloop-widget-script';

const ACCOUNT_PLAN_STORAGE_KEY = 'seo-pro-plan';
const LandingPage = lazy(() => import('./pages/LandingPage'));
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const SiteAudit = lazy(() => import('./tools/SiteAudit'));
const KeywordResearch = lazy(() => import('./tools/KeywordResearch'));
const BacklinkAnalyzer = lazy(() => import('./tools/BacklinkAnalyzer'));
const CompetitorAnalysis = lazy(() => import('./tools/CompetitorAnalysis'));
const RankTracker = lazy(() => import('./tools/RankTracker'));
const SiteHealth = lazy(() => import('./tools/SiteHealth'));
const Reports = lazy(() => import('./tools/Reports'));
const GSCDataVisualizer = lazy(() => import('./tools/GSCDataVisualizer'));
const CTROptimizer = lazy(() => import('./tools/CTROptimizer'));
const QueryIntentClassifier = lazy(() => import('./tools/QueryIntentClassifier'));
const IntentReshaper = lazy(() => import('./tools/IntentReshaper'));
const Settings = lazy(() => import('./pages/Settings'));

function getStoredPlan(): AccountPlan {
  if (typeof window === 'undefined') return 'free';

  const storedPlan = window.localStorage.getItem(ACCOUNT_PLAN_STORAGE_KEY);
  if (storedPlan === 'pro' || storedPlan === 'agency') {
    return storedPlan;
  }

  return 'free';
}

function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [lastAudit, setLastAudit] = useState<SEOAuditResult | null>(null);
  const [auditHistory, setAuditHistory] = useState<SEOAuditResult[]>([]);
  const [gscRows, setGscRows] = useState<GSCPerformanceRow[] | null>(null);
  const [gscSource, setGscSource] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userPlan, setUserPlanState] = useState<AccountPlan>(() => getStoredPlan());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState(isFirebaseConfigured);

  useEffect(() => {
    if (!ASSISTLOOP_AGENT_ID) {
      return;
    }

    const initWidget = () => {
      if (!window.AssistLoopWidget || window.__assistLoopInitialized) {
        return;
      }

      window.AssistLoopWidget.init({
        agentId: ASSISTLOOP_AGENT_ID,
      });
      window.__assistLoopInitialized = true;
    };

    const existingScript = document.getElementById(ASSISTLOOP_SCRIPT_ID) as HTMLScriptElement | null;
    if (existingScript) {
      if (window.AssistLoopWidget) {
        initWidget();
      } else {
        existingScript.addEventListener('load', initWidget);
      }

      return () => existingScript.removeEventListener('load', initWidget);
    }

    const script = document.createElement('script');
    script.id = ASSISTLOOP_SCRIPT_ID;
    script.src = 'https://assistloop.ai/assistloop-widget.js';
    script.async = true;
    script.addEventListener('load', initWidget);
    document.head.appendChild(script);

    return () => script.removeEventListener('load', initWidget);
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(Boolean(user));
      setUserId(user?.uid ?? null);
      setUserEmail(user?.email ?? null);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

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
    if (!isFirebaseConfigured || !auth) {
      throw new Error('Firebase Auth is not configured. Set VITE_FIREBASE_* env vars.');
    }

    await signInWithEmailAndPassword(auth, email, password);
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    if (!isFirebaseConfigured || !auth) {
      throw new Error('Firebase Auth is not configured. Set VITE_FIREBASE_* env vars.');
    }

    await createUserWithEmailAndPassword(auth, email, password);
  }, []);

  const logout = useCallback(async () => {
    if (!isFirebaseConfigured || !auth) {
      return;
    }

    await signOut(auth);
  }, []);

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
              <Analytics />
              <Suspense fallback={<FullScreenLoading />}>
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
      path="/settings"
      element={
        <ProtectedRoute isAuthenticated={isAuthenticated} authLoading={authLoading}>
          <Settings />
        </ProtectedRoute>
      }
    />

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
</Suspense>
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

