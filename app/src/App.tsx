import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, createContext } from 'react';
import LandingPage from './pages/LandingPage';
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
import type { GSCPerformanceRow } from './types';
import './App.css';

// Theme context for dark mode
export const ThemeContext = createContext({
  isDarkMode: true,
  toggleTheme: () => {},
});

// Audit context for sharing audit results across tools
export const AuditContext = createContext<{
  lastAudit: any;
  setLastAudit: (audit: any) => void;
  auditHistory: any[];
  addToHistory: (audit: any) => void;
}>({
  lastAudit: null,
  setLastAudit: () => {},
  auditHistory: [],
  addToHistory: () => {},
});

export const GSCContext = createContext<{
  gscRows: GSCPerformanceRow[] | null;
  setGscRows: (rows: GSCPerformanceRow[] | null) => void;
  gscSource: string | null;
  setGscSource: (source: string | null) => void;
}>({
  gscRows: null,
  setGscRows: () => {},
  gscSource: null,
  setGscSource: () => {},
});

function App() {
  const [isDarkMode] = useState(true);
  const [lastAudit, setLastAudit] = useState<any>(null);
  const [auditHistory, setAuditHistory] = useState<any[]>([]);
  const [gscRows, setGscRows] = useState<GSCPerformanceRow[] | null>(null);
  const [gscSource, setGscSource] = useState<string | null>(null);

  const addToHistory = (audit: any) => {
    setAuditHistory(prev => [audit, ...prev].slice(0, 10));
  };

  const toggleTheme = () => {
    // Theme toggle functionality if needed later
  };

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
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </GSCContext.Provider>
      </AuditContext.Provider>
    </ThemeContext.Provider>
  );
}

export default App;
