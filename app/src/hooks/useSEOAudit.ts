import { useState, useCallback } from 'react';
import type { SEOAuditResult, SEOIssue, SEOMetrics, TrafficDataPoint, KeywordSuggestion, CompetitorData } from '@/types';

const generateMockIssues = (): SEOIssue[] => [
  {
    id: '1',
    title: 'Missing meta descriptions',
    description: '3 pages are missing meta descriptions which can hurt click-through rates.',
    severity: 'high',
    category: 'meta',
  },
  {
    id: '2',
    title: 'Images without alt text',
    description: '12 images are missing alt attributes, affecting accessibility and SEO.',
    severity: 'high',
    category: 'images',
  },
  {
    id: '3',
    title: 'Low text-to-HTML ratio',
    description: 'Content represents less than 10% of the page code. Consider reducing inline scripts.',
    severity: 'medium',
    category: 'performance',
  },
  {
    id: '4',
    title: 'Broken internal links',
    description: '2 internal links are returning 404 errors.',
    severity: 'medium',
    category: 'links',
  },
  {
    id: '5',
    title: 'Schema markup missing',
    description: 'No structured data detected. Adding schema can improve rich snippets.',
    severity: 'low',
    category: 'meta',
  },
  {
    id: '6',
    title: 'Missing H1 heading',
    description: '1 page is missing an H1 heading.',
    severity: 'high',
    category: 'headings',
  },
];

const generateMockMetrics = (): SEOMetrics => ({
  organicTraffic: 34,
  keywordRankings: 10,
  clickThroughRate: 5.8,
  conversionRate: 3.2,
});

const generateTrafficData = (): TrafficDataPoint[] => [
  { month: 'Jan', sessions: 1200 },
  { month: 'Feb', sessions: 1450 },
  { month: 'Mar', sessions: 1380 },
  { month: 'Apr', sessions: 1820 },
  { month: 'May', sessions: 2100 },
  { month: 'Jun', sessions: 2450 },
];

const generateKeywordSuggestions = (): KeywordSuggestion[] => [
  { keyword: 'seo optimization', volume: 12500, difficulty: 45, cpc: 8.5 },
  { keyword: 'website audit tool', volume: 8200, difficulty: 38, cpc: 12.3 },
  { keyword: 'rank tracking', volume: 6800, difficulty: 52, cpc: 15.7 },
  { keyword: 'backlink analysis', volume: 5400, difficulty: 41, cpc: 9.2 },
  { keyword: 'keyword research', volume: 22100, difficulty: 58, cpc: 11.8 },
];

const generateCompetitorData = (): CompetitorData[] => [
  { domain: 'competitor1.com', score: 78, keywords: 2450, backlinks: 12500, traffic: 50000, topKeywords: ['seo', 'marketing', 'tools'] },
  { domain: 'competitor2.com', score: 82, keywords: 3100, backlinks: 18900, traffic: 75000, topKeywords: ['analytics', 'reporting', 'data'] },
  { domain: 'competitor3.com', score: 71, keywords: 1890, backlinks: 8200, traffic: 35000, topKeywords: ['audit', 'monitoring', 'check'] },
];

export const useSEOAudit = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SEOAuditResult | null>(null);
  const [trafficData] = useState<TrafficDataPoint[]>(generateTrafficData());
  const [keywords] = useState<KeywordSuggestion[]>(generateKeywordSuggestions());
  const [competitors] = useState<CompetitorData[]>(generateCompetitorData());

  const runAudit = useCallback(async (_url: string) => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const issues = generateMockIssues();
    const metrics = generateMockMetrics();
    
    // Calculate score based on issues
    const highImpactIssues = issues.filter(i => i.severity === 'high').length;
    const mediumImpactIssues = issues.filter(i => i.severity === 'medium').length;
    const score = Math.max(0, 100 - (highImpactIssues * 8) - (mediumImpactIssues * 4));
    
    let status: SEOAuditResult['status'] = 'poor';
    if (score >= 90) status = 'excellent';
    else if (score >= 75) status = 'good';
    else if (score >= 50) status = 'fair';
    
    setResult({
      url: _url,
      score: Math.round(score),
      status,
      issues,
      metrics,
      crawledAt: new Date().toISOString(),
      pageCount: 1 + (Math.random() * 50),
      loadTime: (1 + Math.random() * 3).toFixed(2),
    });
    
    setIsLoading(false);
    return { score: Math.round(score), status };
  }, []);

  const resetAudit = useCallback(() => {
    setResult(null);
  }, []);

  return {
    isLoading,
    result,
    trafficData,
    keywords,
    competitors,
    runAudit,
    resetAudit,
  };
};

export default useSEOAudit;
