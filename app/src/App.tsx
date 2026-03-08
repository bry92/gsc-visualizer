import { Routes, Route, Navigate } from 'react-router-dom';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { SpeedInsights } from '@vercel/speed-insights/react';
import type { Session } from '@supabase/supabase-js';
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
import type { GSCPerformanceRow, SEOAuditResult } from './types';
import type { AccountPlan } from './contexts/app-context';
import { AuditContext, AuthContext, GSCContext, ThemeContext } from './contexts/app-context';
import { supabase } from './lib/supabase';
import './App.css';

const ACCOUNT_PLAN_STORAGE_KEY = 'seo-pro-plan';

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
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const syncAuthState = (session: Session | null) => {
      const user = session?.user ?? null;
      setIsAuthenticated(Boolean(user));
      setUserId(user?.id ?? null);
      setUserEmail(user?.email ?? null);
      setAuthLoading(false);
    };

    const loadSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        setIsAuthenticated(false);
        setUserId(null);
        setUserEmail(null);
        setAuthLoading(false);
        return;
      }

      syncAuthState(data.session);
    };

    void loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      syncAuthState(session);
    });

    return () => subscription.unsubscribe();
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
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
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
              <SpeedInsights />
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
