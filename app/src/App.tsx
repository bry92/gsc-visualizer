import { Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import { SpeedInsights } from '@vercel/speed-insights/react';
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
import { firebaseAuth, isFirebaseConfigured } from './lib/firebase';
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
  const [authLoading, setAuthLoading] = useState(isFirebaseConfigured);

  useEffect(() => {
    if (!isFirebaseConfigured || !firebaseAuth) return;

    const unsub = onAuthStateChanged(firebaseAuth, (user) => {
      setIsAuthenticated(Boolean(user));
      setUserId(user?.uid ?? null);
      setUserEmail(user?.email ?? null);
      setAuthLoading(false);
    });
    return () => unsub();
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
    if (!isFirebaseConfigured || !firebaseAuth) {
      throw new Error('Firebase Auth is not configured. Set VITE_FIREBASE_* env vars.');
    }
    await signInWithEmailAndPassword(firebaseAuth, email, password);
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    if (!isFirebaseConfigured || !firebaseAuth) {
      throw new Error('Firebase Auth is not configured. Set VITE_FIREBASE_* env vars.');
    }
    await createUserWithEmailAndPassword(firebaseAuth, email, password);
  }, []);

  const logout = useCallback(async () => {
    if (!firebaseAuth) return;
    await signOut(firebaseAuth);
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
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      <AuditContext.Provider value={{ lastAudit, setLastAudit, auditHistory, addToHistory }}>
        <GSCContext.Provider value={{ gscRows, setGscRows, gscSource, setGscSource }}>
          <div className={`min-h-screen ${isDarkMode ? 'bg-dark' : 'bg-white'}`}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/tools/audit" element={<SiteAudit />} />
              <Route path="/tools/keywords" element={<KeywordResearch />} />
              <Route path="/tools/backlinks" element={<BacklinkAnalyzer />} />
              <Route path="/tools/competitors" element={<CompetitorAnalysis />} />
              <Route path="/tools/rank-tracker" element={<RankTracker />} />
              <Route path="/tools/site-health" element={<SiteHealth />} />
              <Route path="/tools/reports" element={<Reports />} />
              <Route path="/tools/gsc-visualizer" element={<GSCDataVisualizer />} />
              <Route path="/tools/ctr-optimizer" element={<CTROptimizer />} />
              <Route path="/tools/intent-classifier" element={<QueryIntentClassifier />} />
              <Route path="/tools/intent-reshaper" element={<IntentReshaper />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <SpeedInsights />
          </div>
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
