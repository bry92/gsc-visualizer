import type { SEOAuditResult, SEOIssue, SEOMetrics, KeywordSuggestion, BacklinkData, CompetitorData } from '@/types';

// Generate a hash from URL for consistent mock results
function hashUrl(url: string): number {
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    const char = url.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

// Generate issues based on URL hash
function generateIssues(url: string): SEOIssue[] {
  const hash = hashUrl(url);
  
  const possibleIssues: SEOIssue[] = [
    {
      id: 'meta-1',
      title: 'Missing meta description',
      description: 'The page is missing a meta description tag, which can hurt click-through rates from search results.',
      severity: 'high',
      category: 'meta',
    },
    {
      id: 'meta-2',
      title: 'Title tag too long',
      description: 'The title tag exceeds 60 characters and may be truncated in search results.',
      severity: 'medium',
      category: 'meta',
    },
    {
      id: 'meta-3',
      title: 'Missing Open Graph tags',
      description: 'Open Graph tags are missing, affecting social media sharing previews.',
      severity: 'low',
      category: 'meta',
    },
    {
      id: 'heading-1',
      title: 'Missing H1 heading',
      description: 'The page lacks an H1 heading, which is crucial for SEO structure.',
      severity: 'high',
      category: 'headings',
    },
    {
      id: 'heading-2',
      title: 'Multiple H1 tags',
      description: 'The page has multiple H1 tags. Each page should have only one H1.',
      severity: 'medium',
      category: 'headings',
    },
    {
      id: 'heading-3',
      title: 'Heading hierarchy broken',
      description: 'Heading levels are skipped (e.g., H2 followed by H4).',
      severity: 'low',
      category: 'headings',
    },
    {
      id: 'image-1',
      title: 'Images missing alt text',
      description: 'Several images are missing alt attributes, affecting accessibility and SEO.',
      severity: 'high',
      category: 'images',
    },
    {
      id: 'image-2',
      title: 'Oversized images',
      description: 'Some images are larger than necessary, slowing down page load.',
      severity: 'medium',
      category: 'images',
    },
    {
      id: 'link-1',
      title: 'Broken internal links',
      description: 'Found 3 internal links returning 404 errors.',
      severity: 'high',
      category: 'links',
    },
    {
      id: 'link-2',
      title: 'External links without rel="nofollow"',
      description: 'Some external links should use nofollow for better SEO control.',
      severity: 'low',
      category: 'links',
    },
    {
      id: 'perf-1',
      title: 'Slow page load time',
      description: 'Page takes over 3 seconds to load, which can hurt rankings.',
      severity: 'high',
      category: 'performance',
    },
    {
      id: 'perf-2',
      title: 'Render-blocking resources',
      description: 'CSS and JavaScript files are blocking page rendering.',
      severity: 'medium',
      category: 'performance',
    },
    {
      id: 'perf-3',
      title: 'Missing browser caching',
      description: 'Static resources lack proper caching headers.',
      severity: 'low',
      category: 'performance',
    },
    {
      id: 'sec-1',
      title: 'Missing HTTPS redirect',
      description: 'HTTP requests are not automatically redirected to HTTPS.',
      severity: 'high',
      category: 'security',
    },
    {
      id: 'sec-2',
      title: 'Missing security headers',
      description: 'Content Security Policy and other security headers are absent.',
      severity: 'medium',
      category: 'security',
    },
  ];

  // Select 4-8 random issues based on hash
  const numIssues = 4 + (hash % 5);
  const shuffled = [...possibleIssues].sort(() => (hash % 2 === 0 ? 1 : -1));
  
  return shuffled.slice(0, numIssues);
}

// Calculate score from issues
function calculateScore(issues: SEOIssue[]): number {
  const highCount = issues.filter(i => i.severity === 'high').length;
  const mediumCount = issues.filter(i => i.severity === 'medium').length;
  const lowCount = issues.filter(i => i.severity === 'low').length;
  
  let score = 100;
  score -= highCount * 8;
  score -= mediumCount * 4;
  score -= lowCount * 1;
  
  return Math.max(0, Math.min(100, score));
}

// Generate metrics based on URL
function generateMetrics(url: string): SEOMetrics {
  const hash = hashUrl(url);
  
  return {
    organicTraffic: 15 + (hash % 50),
    keywordRankings: 5 + (hash % 20),
    clickThroughRate: parseFloat((2 + (hash % 6) + Math.random()).toFixed(1)),
    conversionRate: parseFloat((1 + (hash % 4) + Math.random()).toFixed(1)),
  };
}

// Main audit function
export async function performSEOAudit(url: string): Promise<SEOAuditResult> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000));
  
  const issues = generateIssues(url);
  const score = calculateScore(issues);
  const metrics = generateMetrics(url);
  
  let status: SEOAuditResult['status'] = 'poor';
  if (score >= 90) status = 'excellent';
  else if (score >= 75) status = 'good';
  else if (score >= 50) status = 'fair';
  
  return {
    url,
    score,
    status,
    issues,
    metrics,
    crawledAt: new Date().toISOString(),
    pageCount: 1 + (hashUrl(url) % 50),
    loadTime: (1 + (hashUrl(url) % 40) / 10).toFixed(2),
  };
}

// Generate keyword suggestions
export async function getKeywordSuggestions(seed: string): Promise<KeywordSuggestion[]> {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const hash = hashUrl(seed);
  const baseKeywords = [
    'seo tools', 'website optimization', 'rank tracking', 
    'backlink analysis', 'keyword research', 'site audit',
    'on-page seo', 'technical seo', 'content strategy',
    'local seo', 'mobile optimization', 'page speed'
  ];
  
  return baseKeywords.map((kw, i) => ({
    keyword: `${seed} ${kw}`,
    volume: 1000 + ((hash + i * 100) % 49000),
    difficulty: 10 + ((hash + i * 50) % 80),
    cpc: parseFloat((0.5 + ((hash + i * 25) % 20)).toFixed(2)),
    trend: ((hash + i * 75) % 40) - 20,
  }));
}

// Generate backlink data
export async function getBacklinkData(url: string): Promise<BacklinkData> {
  await new Promise(resolve => setTimeout(resolve, 1200));
  
  const hash = hashUrl(url);
  const totalBacklinks = 100 + (hash % 5000);
  const referringDomains = 20 + (hash % 500);
  
  return {
    url,
    totalBacklinks,
    referringDomains,
    domainAuthority: 10 + (hash % 80),
    pageAuthority: 10 + (hash % 70),
    newBacklinks: Math.floor(totalBacklinks * 0.1),
    lostBacklinks: Math.floor(totalBacklinks * 0.05),
    followLinks: Math.floor(totalBacklinks * 0.7),
    nofollowLinks: Math.floor(totalBacklinks * 0.3),
    topReferringDomains: [
      { domain: 'example-blog.com', backlinks: 15 + (hash % 30), authority: 40 + (hash % 40) },
      { domain: 'news-site.com', backlinks: 10 + (hash % 20), authority: 60 + (hash % 30) },
      { domain: 'industry-hub.org', backlinks: 8 + (hash % 15), authority: 50 + (hash % 35) },
      { domain: 'tech-forum.net', backlinks: 5 + (hash % 10), authority: 35 + (hash % 30) },
      { domain: 'directory-list.com', backlinks: 3 + (hash % 8), authority: 25 + (hash % 25) },
    ],
    anchorTexts: [
      { text: 'click here', count: Math.floor(totalBacklinks * 0.15) },
      { text: 'read more', count: Math.floor(totalBacklinks * 0.12) },
      { text: url.split('/')[2] || 'homepage', count: Math.floor(totalBacklinks * 0.25) },
      { text: 'visit website', count: Math.floor(totalBacklinks * 0.08) },
      { text: 'learn more', count: Math.floor(totalBacklinks * 0.1) },
    ],
  };
}

// Generate competitor data
export async function getCompetitorData(url: string): Promise<CompetitorData[]> {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const hash = hashUrl(url);
  const domain = url.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  
  return [
    {
      domain: `competitor-${(hash % 100)}.com`,
      score: 60 + (hash % 35),
      keywords: 500 + (hash % 3000),
      backlinks: 1000 + (hash % 10000),
      traffic: 5000 + (hash % 50000),
      topKeywords: ['seo tools', 'marketing', 'digital strategy'],
    },
    {
      domain: `rival-${(hash % 50)}.io`,
      score: 55 + ((hash * 2) % 40),
      keywords: 400 + ((hash * 3) % 2500),
      backlinks: 800 + ((hash * 2) % 8000),
      traffic: 4000 + ((hash * 2) % 40000),
      topKeywords: ['analytics', 'reporting', 'optimization'],
    },
    {
      domain: `alternative-${(hash % 30)}.net`,
      score: 50 + ((hash * 3) % 45),
      keywords: 300 + ((hash * 4) % 2000),
      backlinks: 600 + ((hash * 3) % 6000),
      traffic: 3000 + ((hash * 3) % 30000),
      topKeywords: ['audit', 'monitoring', 'analysis'],
    },
    {
      domain,
      score: 65 + (hash % 30),
      keywords: 600 + (hash % 4000),
      backlinks: 1200 + (hash % 12000),
      traffic: 6000 + (hash % 60000),
      topKeywords: ['seo pro', 'toolkit', 'ranking'],
      isYou: true,
    },
  ].sort((a, b) => b.score - a.score);
}

// Generate rank tracking data
export async function getRankData(keyword: string, url: string) {
  await new Promise(resolve => setTimeout(resolve, 600));
  
  const hash = hashUrl(keyword + url);
  
  return {
    keyword,
    currentPosition: 1 + (hash % 20),
    previousPosition: 1 + ((hash + 50) % 25),
    highestPosition: 1 + (hash % 5),
    lowestPosition: 15 + (hash % 20),
    searchVolume: 1000 + (hash % 50000),
    history: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      position: Math.max(1, 5 + (hash + i * 10) % 25 - Math.floor(i / 5)),
    })),
  };
}

// Generate site health data
export async function getSiteHealthData(url: string) {
  await new Promise(resolve => setTimeout(resolve, 900));
  
  const hash = hashUrl(url);
  
  return {
    overallHealth: 60 + (hash % 40),
    uptime: 99 + (hash % 100) / 100,
    avgLoadTime: (0.5 + (hash % 30) / 10).toFixed(2),
    sslValid: hash % 10 !== 0,
    sslExpiry: new Date(Date.now() + (30 + (hash % 60)) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    mobileFriendly: hash % 5 !== 0,
    coreWebVitals: {
      lcp: (1 + (hash % 25) / 10).toFixed(2),
      fid: (10 + (hash % 90)),
      cls: ((hash % 25) / 100).toFixed(3),
    },
    crawlStats: {
      pagesCrawled: 100 + (hash % 900),
      pagesIndexed: 90 + (hash % 800),
      crawlErrors: hash % 20,
      blockedByRobots: hash % 10,
    },
    issues: {
      critical: hash % 5,
      warnings: 5 + (hash % 15),
      notices: 10 + (hash % 20),
    },
  };
}
