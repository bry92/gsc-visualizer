export interface SEOAuditResult {
  url: string;
  score: number;
  status: 'excellent' | 'good' | 'fair' | 'poor';
  issues: SEOIssue[];
  metrics: SEOMetrics;
  crawledAt: string;
  pageCount: number;
  loadTime: string;
}

export interface SEOIssue {
  id: string;
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  category: 'meta' | 'headings' | 'images' | 'links' | 'performance' | 'security';
}

export interface SEOMetrics {
  organicTraffic: number;
  keywordRankings: number;
  clickThroughRate: number;
  conversionRate: number;
}

export interface TrafficDataPoint {
  month: string;
  sessions: number;
}

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface KeywordSuggestion {
  keyword: string;
  volume: number;
  difficulty: number;
  cpc: number;
  trend?: number;
}

export interface CompetitorData {
  domain: string;
  score: number;
  keywords: number;
  backlinks: number;
  traffic: number;
  topKeywords: string[];
  isYou?: boolean;
}

export interface BacklinkData {
  url: string;
  totalBacklinks: number;
  referringDomains: number;
  domainAuthority: number;
  pageAuthority: number;
  newBacklinks: number;
  lostBacklinks: number;
  followLinks: number;
  nofollowLinks: number;
  topReferringDomains: {
    domain: string;
    backlinks: number;
    authority: number;
  }[];
  anchorTexts: {
    text: string;
    count: number;
  }[];
}

export interface RankData {
  keyword: string;
  currentPosition: number;
  previousPosition: number;
  highestPosition: number;
  lowestPosition: number;
  searchVolume: number;
  history: {
    date: string;
    position: number;
  }[];
}

export interface SiteHealthData {
  overallHealth: number;
  uptime: number;
  avgLoadTime: string;
  sslValid: boolean;
  sslExpiry: string;
  mobileFriendly: boolean;
  coreWebVitals: {
    lcp: string;
    fid: number;
    cls: string;
  };
  crawlStats: {
    pagesCrawled: number;
    pagesIndexed: number;
    crawlErrors: number;
    blockedByRobots: number;
  };
  issues: {
    critical: number;
    warnings: number;
    notices: number;
  };
}

export interface Report {
  id: string;
  name: string;
  type: 'audit' | 'keyword' | 'backlink' | 'competitor';
  createdAt: string;
  url?: string;
  data: any;
}

export interface GSCPerformanceRow {
  query: string;
  page: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  date?: string;
}

export interface GSCOverviewMetrics {
  totalClicks: number;
  totalImpressions: number;
  averageCtr: number;
  averagePosition: number;
}

export interface GSCTrendPoint {
  date: string;
  clicks: number;
  impressions: number;
  ctr: number;
  avgPosition: number;
}

export interface GSCOpportunityRow extends GSCPerformanceRow {
  expectedCtr: number;
  ctrGap: number;
  opportunityScore: number;
}

export interface GSCCSVParseResult {
  rows: GSCPerformanceRow[];
  missingColumns: string[];
}

export interface CTROptimizerRow extends GSCOpportunityRow {
  priority: 'High' | 'Medium' | 'Low';
}

export type QueryIntent =
  | 'Transactional'
  | 'Commercial'
  | 'Navigational'
  | 'Informational';
